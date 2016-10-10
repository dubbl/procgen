// code by Michal Budzynski
// http://michalbe.blogspot.dk/2011/02/javascript-random-numbers-with-custom_23.html
var CustomRandom = function(nseed) {
  var seed,
      constant = Math.pow(2, 13)+1,
      prime = 1987,
      maximum = 1000;

  if (nseed) {
    seed = nseed;
  }
  if (seed == null) {
    seed = (new Date()).getTime();
  }

  return {
    next : function(min, max) {
      seed *= constant;
      seed += prime;
      if (min >= 0 && max > min) {
        return min+seed%maximum/maximum*(max-min);
      } else {
        return seed%maximum/maximum;
      }
    },
    nextInt : function(min, max) {
      return Math.round(this.next(min, max));
    }
  }
}
