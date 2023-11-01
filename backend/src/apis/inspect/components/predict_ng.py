import os
import numpy as np
import tensorflow as tf


def prediction(chip_type, pred_dict):
    """
    Main function to call sub functions for predicting defective chips

    Parameters
    ----------
    chip_type : str
        Chip item full name to retrieve AI model for it
    pred_dict : dict
        Images stored in dictionary for AI to predict

    Returns
    -------
    result : dict
        Prediction results images stored in dictionary
    """
    model = load_model(chip_type)
    result = run_CNN(model, pred_dict)

    return result


def load_model(chip_type):
    """
    Parameters
    ----------
    chip_type : str
        Chip item full name to retrieve AI model for it

    Returns
    -------
    model : keras model instance
        Keras model instance for prediction
    """
    parent_path = os.path.dirname(os.path.dirname(__file__))
    ModelPath = os.path.join(parent_path, "model", chip_type + ".h5")
    model = tf.keras.models.load_model(ModelPath)

    return model


def run_CNN(model, pred_dict):
    """
    Parameters
    ----------
    model : keras model instance
        Keras model instance for prediction
    pred_dict : dict
        Images stored in dictionary for AI to predict

    Returns
    -------
    pred_dict : dict
        Prediction results images stored in dictionary
    """
    pred_arr = np.array(list(pred_dict.values()))
    pred_res = np.argmax(model.predict(pred_arr, batch_size=256, verbose=2), axis=1)

    # TODO: Fix the key indexing via .env file
    # 0 : Good, 1 : Defects, 2 : Others
    for i, key in enumerate(list(pred_dict.keys())):
        if pred_res[i] != 1 and pred_res[i] != 2:
            del pred_dict[key]

    return pred_dict
