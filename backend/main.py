from flask import Flask
import tensorflow as tf
from transformers import AutoTokenizer, TFAutoModelForSeq2SeqLM
from official.projects.movinet.modeling import movinet
from official.projects.movinet.modeling import movinet_model_a2_modified as movinet_model_modified
import cv2
import numpy as np
from PIL import Image

tf.keras.backend.clear_session()

backbone = movinet.Movinet(model_id='a2')
backbone.trainable = False

model = movinet_model_modified.MovinetClassifier(backbone=backbone, num_classes=600)
model.build([None, None, None, None, 3])

# Load pre-trained weights after downloading them
checkpoint_path = 'movinet_checkpoints_a2_epoch9'
checkpoint = tf.train.Checkpoint(model=model)
status = checkpoint.restore(checkpoint_path)
status.assert_existing_objects_matched()

tokenizer = AutoTokenizer.from_pretrained("deanna-emery/ASL_t5_movinet_sentence")
model = TFAutoModelForSeq2SeqLM.from_pretrained("deanna-emery/ASL_t5_movinet_sentence")