from pydantic import BaseModel

class ShowNG(BaseModel):
    plate_no: str
    ng_chips: dict
    img_shape: list
    no_of_batches: str
    no_of_chips: str
    ng_count: str
    directory: str
    chip_type: str
