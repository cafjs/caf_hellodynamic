/*
 *   ex1: detects moving hand up quickly. Debounces to ensure only one detection
 * for movement.
 */
/**
 * Detects a gesture.
 * Executes in the device for faster data sampling.
 *
 * @param(data) A sensor datapoint with keys rawX, rawZ, index,
 * z, x, dZ, and dX   (all values are numbers).
 * @param(acc) An object, initially empty,  providing shared state
 * across invocations.
 *
 * @returns  True for a detection.
 **/
 function(data, acc) {
     if (data.dZ > 15) {
         if (acc.goingUp) {
             return false;
         } else {
             acc.goingUp = true;
             return true;
         }
     } else {
         if (data.dZ < 0) {
             acc.goingUp = false;
         }
         return false;
     }
 }
