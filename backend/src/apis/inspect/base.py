import os
import cv2
import requests
from shutil import copyfileobj, rmtree, copyfile

from core.config import settings
from apis.inspect.components.batch_process import mask
from apis.inspect.components.chip_process import chips
from apis.inspect.components.predict_ng import prediction
from apis.inspect.components.initialize import check_dir, create_border_img


def inspect(image, lot_no, chip_type, db):

    no_of_chips, NG, save_dir, pred_dir = check_dir(image, lot_no, db)
    border_img, img_shape = create_border_img(image, save_dir)
    if any(NG.values()): return NG, save_dir, img_shape, no_of_chips

    batch_data = mask(border_img, img_shape)
    no_of_chips, pred_dict, ng_dict = chips(border_img, batch_data)
    pred_dict_res = prediction(chip_type, pred_dict)

    ng_dict.update(pred_dict_res)

    NG = {"Stray":[]}
    for i in range(len(batch_data)): NG[f"Batch {i+1}"] = []

    for key,value in ng_dict.items():

        ng_img=cv2.cvtColor(value,cv2.COLOR_RGB2BGR)
        cv2.imwrite(os.path.join(pred_dir,key),ng_img)

        if int(key.split("_")[1]) != 0 : NG["Batch " + key.split("_")[1]].append(key)
        else: NG["Stray"].append(key)

    return NG, save_dir, img_shape, len(batch_data), no_of_chips