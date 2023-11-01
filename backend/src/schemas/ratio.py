from pydantic import BaseModel


class CreateRatio(BaseModel):
    lot_no: str
    plate_no: str
    ng_list: list
    others_list: list
    no_of_batches: int
    no_of_chips: int
    no_of_pred: int
    no_of_ng: int
    no_of_others: int
    directory: str
    chip_type: str


class UpdateRatio(CreateRatio):
    pass


class ShowRatio(BaseModel):
    no_of_chips: int

    class Config:  # tells pydantic to convert even non dict obj to json
        from_attributes = True
