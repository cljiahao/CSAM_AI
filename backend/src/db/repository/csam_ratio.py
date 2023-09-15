from db.models.csam_ratio import CSAM_RATIO
from schemas.ratio import CreateRatio
from sqlalchemy.orm import Session


def create_new_ratio(ratio: CreateRatio, db: Session):

    ratio_dict = ratio.dict()

    # TODO: Get previously selected NG chips and add 
    actual = ratio_dict.pop('actual')
    directory = ratio_dict.pop('directory')

    no_of_chips = int(ratio_dict['no_of_chips'])
    real_ng = int(ratio_dict['real_ng'])
    pred_ng = int(ratio_dict['pred_ng'])
    ng_ratio = round(real_ng/no_of_chips*100,2)
    fake_ratio = round(real_ng/pred_ng*100,2) if pred_ng != 0 else 0

    ratio = CSAM_RATIO(
        **ratio_dict, ng_ratio=ng_ratio, fake_ratio=fake_ratio
    )
    # db.add(ratio)
    # db.commit()
    # db.refresh(ratio)

    return ratio

def get_ratio(lot_no: str, plate_no: str, db: Session):

    ratio = db.query(CSAM_RATIO).filter(CSAM_RATIO.lot_no == lot_no, CSAM_RATIO.plate_no == plate_no).first()
    
    return ratio
