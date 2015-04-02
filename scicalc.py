# -*- coding: utf-8 -*-
""" SciCalc - Scientific Calculator Module
    Version 0.1
    @author: Ryan Fung
    Create Date: 2013-12-21
    Last Modified: 2013-12-21
"""

from numpy import array


class unit(object):
    def __init__(self, arg):
        if type(arg) != str:
            raise TypeError("Input must be a string")
        inputs = arg.split()
        if len(inputs) == 1:
            #  Parse dimensionless input
            pass
        try:
            self.value = float(inputs[0])
        except ValueError:
            raise ValueError("Input string must lead with a number")
        if inputs[1] in u2p:  # check for units
            pass

u2p = {"kg": array([1, 0, 0, 0, 0, 0, 0]),
       "m":  array([0, 1, 0, 0, 0, 0, 0]),
       "s":  array([0, 0, 1, 0, 0, 0, 0]),
       "A":  array([0, 0, 0, 1, 0, 0, 0]),
       "K":  array([0, 0, 0, 0, 1, 0, 0]),
       "mol": array([0, 0, 0, 0, 0, 1, 0]),
       "cd": array([0, 0, 0, 0, 0, 0, 1]),
       "rad": array([0, 0, 0, 0, 0, 0, 0]),
       "sr": array([0, 0, 0, 0, 0, 0, 0]),
       "Hz": array([0, 0, -1, 0, 0, 0, 0]),
       "N":  array([1, 1, -2, 0, 0, 0, 0]),
       "Pa": array([1, -1, -2, 0, 0, 0, 0]),
       "J":  array([1, 2, -2, 0, 0, 0, 0]),
       "W":  array([1, 2, -3, 0, 0, 0, 0]),
       "C":  array([0, 0, 1, 1, 0, 0, 0]),
       "V":  array([1, 2, -3, -1, 0, 0, 0]),
       "F":  array([-1, -2, 4, 2, 0, 0, 0]),
       "O":  array([1, 2, -3, -2, 0, 0, 0]),
       "S":  array([-1, -2, 3, 2, 0, 0, 0]),
       "Wb": array([1, 2, -2, -1, 0, 0, 0]),
       "T":  array([1, 0, -2, -1, 0, 0, 0]),
       "H":  array([1, 2, -2, -2, 0, 0, 0]),
       "degC": array([0, 0, 0, 0, 1, 0, 0]),
       "lm": array([0, 0, 0, 0, 0, 0, 1]),
       "lx": array([0, -2, 0, 0, 0, 0, 1]),
       "Bq": array([0, 0, -1, 0, 0, 0, 0]),
       "Gy": array([0, 2, -2, 0, 0, 0, 0]),
       "Sv": array([0, 2, -2, 0, 0, 0, 0]),
       "kat": array([0, 0, -1, 0, 0, 1, 0])
       }
