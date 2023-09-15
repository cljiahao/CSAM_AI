import os
import numpy as np
import tensorflow.keras.models as Model

def prediction(chip_type, pred_dict):
    
    model = load_model(chip_type)
    result = run_CNN(model,pred_dict)

    return result


def load_model(chip_type):

    parent_path = os.path.dirname(os.path.dirname(__file__))
    ModelPath = os.path.join(parent_path,"model", chip_type+".h5")
    model = Model.load_model(ModelPath)

    return model


def run_CNN(model,pred_dict):
    
    pred_arr = np.array(list(pred_dict.values()))
    pred_res = np.argmax(model.predict(pred_arr,batch_size=256,verbose=2),axis=1)
    
    # TODO: Fix the key indexing via .env file
    # 0 : Good, 1 : Not Good, 2 : Yellow
    for i,key in enumerate(list(pred_dict.keys())):
        if (pred_res[i] != 1 and pred_res[i] != 2): del pred_dict[key]
        
    return pred_dict