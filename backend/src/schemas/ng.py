from pydantic import BaseModel

class ShowNG(BaseModel):
    plate_no: str
    ng_chips: dict
    img_shape: list
    no_of_batches: int
    no_of_chips: int
    ng_count: int
    directory: str
    chip_type: str
