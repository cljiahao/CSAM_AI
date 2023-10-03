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


def move_ng(directory,actual):

    temp_dir = os.path.join(directory,"temp")
    ng_dir = os.path.join(directory,"NG")
    if not os.path.isdir(ng_dir): os.makedirs(ng_dir)

    for fname in actual.split(","): move(os.path.join(temp_dir,fname),os.path.join(ng_dir,fname),copy_function=copyfile)


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


def create_new_ratio(ratio: CreateRatio, db: Session = Depends(get_db)):

    ratio_dict = ratio.model_dump()

    directory = ratio_dict.pop('directory')
    actual = ratio_dict.pop('actual')
    
    move_ng(directory=directory, actual=actual)

    lot_no = ratio_dict['lot_no']
    plate_no = os.path.dirname(directory)
    ratio = get_ratio(lot_no=lot_no, plate_no=plate_no, db=db)
    prev_real_ng = ratio.real_ng

    no_of_chips = int(ratio_dict['no_of_chips'])
    real_ng = int(ratio_dict['real_ng']) + prev_real_ng
    pred_ng = int(ratio_dict['pred_ng']) + prev_real_ng
    ng_ratio = round(real_ng/no_of_chips*100,2)
    fake_ratio = round(real_ng/pred_ng*100,2) if pred_ng != 0 else 0

    print(f"Previous Lot Number: {lot_no} Pred NG: {pred_ng} Real NG: {real_ng} NG Ratio: {ng_ratio}% FakeRatio: {fake_ratio}%")

    ratio = CSAM_RATIO(
        **ratio_dict, ng_ratio=ng_ratio, fake_ratio=fake_ratio
    )
    # db.add(ratio)
    # db.commit()
    # db.refresh(ratio)

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