import requests
from fastapi import Form, UploadFile, File
from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from core.config import settings
from db.session import get_db
from db.repository.csam_ratio import create_new_ratio
from schemas.ratio import CreateRatio
from schemas.ng import ShowNG

from apis.inspect.base import inspect

router = APIRouter()


@router.post("/uploadfile", response_model=ShowNG)
def predict_NG_chips(file: UploadFile = File(...), lot_no: str = Form(...), db: Session = Depends(get_db)):

    if lot_no.lower()[:4] == "test": chip_type = settings.CHIPTYPE
    else:
        prass = requests.get(settings.PRASS_URL+lot_no).json()
        if prass['noc0027'] == None: 
            # TODO: Return Error to Frontend
            pass

        chip_type = prass['cdc0163']

    NG, save_dir, img_shape, no_of_batches, no_of_chips = inspect(file, lot_no, chip_type, db)
    ng_count = sum([len(NG[x]) for x in NG if isinstance(NG[x], list)])

    res = ShowNG(filename=file.filename,
                    ng_chips=NG,
                    img_shape=img_shape,
                    no_of_chips=no_of_chips,
                    no_of_batches=no_of_batches,
                    ng_count=ng_count,
                    directory=save_dir,
                    chip_type=chip_type)

    return res


@router.post("/insertDB")
def insert_db(ratio: CreateRatio, db: Session = Depends(get_db)):
    ratio = create_new_ratio(ratio=ratio, db=db)
    return ratio