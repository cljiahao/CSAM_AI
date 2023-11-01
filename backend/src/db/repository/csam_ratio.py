import os
import requests
from fastapi import Depends
from shutil import move, copyfile
from sqlalchemy.orm import Session
from datetime import datetime as dt

from core.config import settings
from schemas.ratio import CreateRatio
from db.session import get_db
from db.models.csam_ratio import CSAM_RATIO


def selected(directory, ng_chip_dict):
    holder = {}
    folders = os.listdir(directory)
    folders.remove("original")
    for fol in folders:
        for os_file in os.listdir(os.path.join(directory, fol)):
            holder[os_file] = fol

    for key in ng_chip_dict:
        move_to_dir = os.path.join(directory, key)
        if not os.path.isdir(move_to_dir):
            os.makedirs(move_to_dir)

        for file in ng_chip_dict[key]:
            try:
                move_files(file, directory, holder[file], key)
                holder.pop(file)
            except:
                if f"1{file[1:]}" in holder.keys():
                    move_files(f"1{file[1:]}", directory, holder[f"1{file[1:]}"], key)
                    holder.pop(f"1{file[1:]}")
                else:
                    move_files(f"2{file[1:]}", directory, holder[f"2{file[1:]}"], key)
                    holder.pop(f"2{file[1:]}")

    for k, v in holder.items():
        if v == "pred":
            continue
        move_files(k, directory, v, "pred")


def move_files(filename, directory, prev, next):
    file_mode = {"pred": "0", "real": "1", "others": "2"}
    src = os.path.join(directory, prev)
    dest = os.path.join(directory, next)

    if filename.split(".")[-1] == "png" and filename[0] == file_mode[prev]:
        if os.path.isfile(os.path.join(src, filename)):
            move(
                os.path.join(src, filename),
                os.path.join(dest, file_mode[next] + filename[1:]),
                copy_function=copyfile,
            )


def get_ratio(lot_no: str, plate_no: str, db: Session):
    ratio = (
        db.query(CSAM_RATIO)
        .filter(CSAM_RATIO.lot_no == lot_no, CSAM_RATIO.plate_no == plate_no)
        .first()
    )

    return ratio


def create_csv(ratio, directory):
    data = ",,,"
    for k in range(len(ratio)):
        data += f"{ratio[k]},"
    file_name = f"{settings.TABLEID}_{dt.now().strftime('%d%m%y')}_{dt.now().strftime('%H%M%S')}.csv"
    file_path = os.path.join(directory, file_name)
    with open(file_path, "w") as f:
        f.write(data[:-1])

    return file_path


def create_new_ratio(ratio: CreateRatio, db: Session = Depends(get_db)):
    ratio_dict = ratio.model_dump()

    directory = ratio_dict.pop("directory")
    ng_list = ratio_dict.pop("ng_list")
    others_list = ratio_dict.pop("others_list")
    ng_chip_dict = {"real": ng_list, "others": others_list}
    selected(directory=directory, ng_chip_dict=ng_chip_dict)

    no_of_chips = ratio_dict["no_of_chips"]
    no_of_ng = ratio_dict["no_of_ng"]
    no_of_others = ratio_dict["no_of_others"]
    no_of_pred = ratio_dict["no_of_pred"]
    ng_ratio = round((no_of_ng + no_of_others) / no_of_chips * 100, 2)
    fake_ratio = (
        round((no_of_ng + no_of_others) / no_of_pred * 100, 2) if no_of_pred != 0 else 0
    )

    print(
        f"Previous Lot Number: {ratio_dict['lot_no']} \
            Pred NG: {no_of_pred} Real NG: {(no_of_ng+no_of_others)} \
            NG Ratio: {ng_ratio}% FakeRatio: {fake_ratio}%"
    )

    ratio = CSAM_RATIO(**ratio_dict, ng_ratio=str(ng_ratio), fake_ratio=str(fake_ratio))

    db.add(ratio)
    db.commit()
    db.refresh(ratio)

    # To Send via HTTP (To REALTIMEDB)
    # file_path = create_csv(ratio, directory)
    # files = {'file': open(file_path, 'rb')}
    # resp = requests.post(settings.REALTIMEDB, files=files)
    # print(f"fileSize: {int(resp.content)}")
    # if int(resp.content) == os.stat(file_path).st_size: os.remove(file_path)

    return ratio


def get_db_data(db: Session):
    ratio = db.query(CSAM_RATIO).first()
    print(ratio)

    return ratio
