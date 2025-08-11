import tensorflow as tf
from official.projects.movinet.modeling import movinet
from official.projects.movinet.modeling import movinet_model_a2_modified as movinet_model_modified

def movinet_model():
    backbone = movinet.Movinet(model_id='a2')
    backbone.trainable = False

    model = movinet_model_modified.MovinetClassifier(backbone=backbone, num_classes=600)
    model.build([None, None, None, None, 3])

    checkpoint_path = 'movinet_checkpoints_a2_epoch9'
    checkpoint = tf.train.Checkpoint(model=model)
    checkpoint.restore(tf.train.latest_checkpoint(checkpoint_path)).expect_partial()