import os
import cv2
from datetime import datetime
from shutil import copyfileobj, rmtree, copyfile

from db.repository.csam_ratio import get_ratio


def create_border_img(image, save_dir):

    #shutil.copyfileobj() method to copy the contents of source file-like object to destination file-like object
    tempFile = "tmp/temp.jpg"
    with open(tempFile, "wb") as buffer: copyfileobj(image.file, buffer)

    ori_dir = os.path.join(save_dir,"original")
    if not os.path.exists(ori_dir): 
        os.makedirs(ori_dir)      
        copyfile("tmp/temp.jpg",os.path.join(ori_dir,image.filename))

    image = cv2.imread(tempFile)
    h, w, z = image.shape
    border_img = cv2.copyMakeBorder(image,20,20,20,20,cv2.BORDER_REPLICATE)

    return border_img, [w,h]


def check_dir(image, lot_no, db):
    
    plate_no = image.filename.split(".")[0]

    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
    lot_dir = os.path.join(backend_dir,'images',datetime.now().strftime("%b%y"),lot_no)
    save_dir = os.path.join(lot_dir,plate_no)
    pred_dir = os.path.join(save_dir,"pred")

    NG = {"Stray": []}
    no_of_chips = 0
    if lot_no.lower()[:4] == "test" and os.path.isdir(lot_dir): rmtree(lot_dir)
    if os.path.isdir(pred_dir) and any(os.scandir(pred_dir)): 
        ratio = get_ratio(lot_no=lot_no, plate_no=plate_no, db=db)
        no_of_chips = ratio.no_of_chips
        for i in range(len(ratio.no_of_batches)): NG[f"Batch {i+1}"] = []
        for prevChips in os.listdir(pred_dir):
            if prevChips.split(".")[-1] == ".png":
                if int(prevChips.split("_")[1]) != 0: NG["Batch " + prevChips.split("_")[1]].append(prevChips)
                else: NG["Stray"].append(prevChips)
    else: 
        if os.path.isdir(save_dir): rmtree(save_dir) 
        os.makedirs(pred_dir)

    return no_of_chips, NG, save_dir, pred_dir