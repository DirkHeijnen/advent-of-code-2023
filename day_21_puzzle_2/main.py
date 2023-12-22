import numpy as np
import math

x_values = np.array([0, 1, 2])
y_values = np.array([3726, 33086, 91672])
coefficients = np.polyfit(x_values, y_values, 2)
result = math.ceil(np.polyval(coefficients, 202300))
print(np.round(result, 0))