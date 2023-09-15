from datetime import datetime
from sqlalchemy import DateTime
from sqlalchemy import Float
from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String

from db.base_class import Base

class CSAM_RATIO(Base):
    id = Column(Integer, primary_key=True, index=False)
    date = Column(DateTime, default=datetime.now)
    lot_no = Column(String, nullable=False)
    plate_no = Column(String, nullable=False)
    no_of_batches = Column(Integer, nullable=False)
    chip_type = Column(String, nullable=False)
    no_of_chips = Column(Integer, nullable=False)
    pred_ng = Column(Float)
    real_ng = Column(Float)
    ng_ratio = Column(Float)
    fake_ratio = Column(Float)