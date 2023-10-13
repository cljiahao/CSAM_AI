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


def selected_ng(directory,actual):

    pred_dir = os.path.join(directory,"pred")
    real_dir = os.path.join(directory,"real")
    if not os.path.isdir(real_dir): os.makedirs(real_dir)

    move_files(actual,pred_dir,real_dir,"0","1")
    to_move_back = list(set(actual).symmetric_difference(set(os.listdir(real_dir))))
    move_files(to_move_back,real_dir,pred_dir,"1","0")


def move_files(files,src,dest,code_from,code_to):
    for fname in files:
        if fname.split(".")[-1] == "png" and fname[0] == code_from:
            move(os.path.join(src,fname),os.path.join(dest,code_to+fname[1:]),copy_function=copyfile)


def get_ratio(lot_no: str, plate_no: str, db: Session):

    ratio = db.query(CSAM_RATIO).filter(CSAM_RATIO.lot_no == lot_no, CSAM_RATIO.plate_no == plate_no).first()
    
    return ratio


def create_csv(ratio, directory):

    data = ",,,"
    for k in range(len(ratio)): data += f"{ratio[k]},"
    file_name = f"{settings.TABLEID}_{dt.now().strftime('%d%m%y')}_{dt.now().strftime('%H%M%S')}.csv"
    file_path = os.path.join(directory,file_name)
    with open(file_path, 'w') as f: f.write(data[:-1])

    return file_path


def create_ratio(ratio: CreateRatio, db: Session = Depends(get_db)):
    
    ratio_dict = ratio.model_dump()

    directory = ratio_dict.pop('directory')
    actual = ratio_dict.pop('actual')
    selected_ng(directory=directory, actual=actual)

    no_of_chips = ratio_dict['no_of_chips']
    real_ng = ratio_dict['real_ng']
    pred_ng = ratio_dict['pred_ng']
    ng_ratio = round(real_ng/no_of_chips*100,2)
    fake_ratio = round(real_ng/pred_ng*100,2) if pred_ng != 0 else 0

    print(f"Previous Lot Number: {ratio_dict['lot_no']} \
            Pred NG: {pred_ng} Real NG: {real_ng} \
            NG Ratio: {ng_ratio}% FakeRatio: {fake_ratio}%")

    ratio = CSAM_RATIO(
        **ratio_dict, ng_ratio=ng_ratio, fake_ratio=fake_ratio
    )
    
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