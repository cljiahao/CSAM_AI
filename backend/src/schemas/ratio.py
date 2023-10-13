from pydantic import BaseModel

class CreateRatio(BaseModel):
    lot_no: str
    plate_no: str
    actual: list
    no_of_batches: int
    no_of_chips: int
    pred_ng: int
    real_ng: int
    directory: str
    chip_type: str

class UpdateRatio(CreateRatio):
    pass

class ShowRatio(BaseModel):
    no_of_chips: int

    class Config:  # tells pydantic to convert even non dict obj to json
        from_attributes = True