import numpy as np
from recognition.imageUtil import paletteDistance, colorDistance

NORM_COLOUR = np.sqrt(3 * 255**2)


# TODO: test if CRITERION: cosinesimilarity vs distance makes a difference
def compareFeatures(obj1, obj2):

    if not obj1 or not obj2:
        return 0

    labelcos = cosineSimilarity(obj1["label"], obj2["label"])
    # labeldist = distance(obj1["label"], obj2["label"])

    objectcos = cosineSimilarity(obj1["object"], obj2["object"])
    # objectcos = distance(obj1["object"], obj2["object"])

    logocos = cosineSimilarity(obj1["logo"], obj2["logo"])
    # logodist = distance(obj1["logo"], obj2["logo"])

    paletteDist = (
        paletteDistance(obj1["color"]["palette"], obj2["color"]["palette"])
        / NORM_COLOUR
    )
    domColorDist = (
        colorDistance(obj1["color"]["dominant"], obj2["color"]["dominant"])
        / NORM_COLOUR
    )
    colorFactor = 0.5 * (1 - paletteDist) + 0.5 * (1 - domColorDist)

    if sum(obj1["logo"]) == 0 or sum(obj2["logo"]) == 0:
        finalValue = labelcos * 0.125 + objectcos * 0.125 + colorFactor * 0.75
    else:
        finalValue = (
            labelcos * 0.4 + objectcos * 0.2 + colorFactor * 0.2 + logocos * 0.2
        )
    return finalValue


def cosineSimilarity(v1, v2):
    if sum(v1) == 0 or sum(v2) == 0:
        return 0
    v1, v2 = np.array(v1), np.array(v2)  # remove
    dot_product = np.dot(v1, v2)
    norm_product = np.linalg.norm(v1) * np.linalg.norm(v2)

    return dot_product / norm_product


def distance(v1, v2):
    v1, v2 = np.array(v1), np.array(v2)  # remove
    dist = np.linalg.norm(v1 - v2)
    return 1 / (1 + dist)
