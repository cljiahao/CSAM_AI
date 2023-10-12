import os
import cv2

from apis.inspect.components.batch_process import mask
from apis.inspect.components.chip_process import chips
from apis.inspect.components.predict_ng import prediction
from apis.inspect.components.initialize import check_dir, create_border_img


def inspect(image, lot_no, chip_type, db):
    """
    Parameters
    ----------
    image : numpy array
        Image to mask out background
    lot_no : str
        Lot number associated
    chip_type : str
        chip_type associated with lot number
    db : Session
        Database session

    Returns
    -------
    NG
        Dict of key: batch to value: predicted NG's file name
    save_dir
        Directory of where the images are saved
    img_shape
        Image height and width
    no_of_batches
        Number of batches found
    no_of_chips
        Number of chips found
    """
    no_of_chips, no_of_batches, NG, save_dir, pred_dir = check_dir(image, lot_no, db)
    border_img, img_shape = create_border_img(image, save_dir)
    if any(NG.values()): return NG, save_dir, img_shape, no_of_batches, no_of_chips                # If exists, return to quicken retrieval

    batch_data = mask(border_img, img_shape)
    no_of_chips, pred_dict, ng_dict = chips(border_img, batch_data)
    pred_dict_res = prediction(chip_type, pred_dict)

    ng_dict.update(pred_dict_res)                                                                   # Update ng_dict with predicted ng

    no_of_batches = len(batch_data)
    NG = {}
    for i in range(no_of_batches): NG[f"Batch {i+1}"] = []

    for key,value in ng_dict.items():

        ng_img=cv2.cvtColor(value,cv2.COLOR_RGB2BGR)
        cv2.imwrite(os.path.join(pred_dir,key),ng_img)                                              # Writing NG images into directory

        if int(key.split("_")[1]) != 0 : NG["Batch " + key.split("_")[1]].append(key)
        elif "Stray" in NG.keys(): NG["Stray"].append(key)
        else: NG["Stray"] = []

    return NG, save_dir, img_shape, no_of_batches, no_of_chips