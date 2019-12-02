const getTop = (element, start) => {
    if(element.nodeName === 'HTML') return -start;
    return element.getBoundingClientRect().top + start
}

const easeInputCubic = t => {
   return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1
}

const position = (start, end, elapsed, duration) => {
    if(elapsed > duration) return end;
    return start + (end - start) * easeInputCubic(elapsed/duration);
}

const smoothScroll = (el, duration, callback, context) => {
    duration = duration || 600;
    context = context || window;
    var start = context.scrollTop || window.pageYOffset;

    if (typeof el === 'number') {
      var end = parseInt(el);
    } else {
      var end = getTop(el, start);
    }

    var clock = Date.now();
    var requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
        function(fn){window.setTimeout(fn, 15);};

    var step = function(){
        var elapsed = Date.now() - clock;
        if (context !== window) {
          context.scrollTop = position(start, end, elapsed, duration);
        }
        else {
          window.scroll(0, position(start, end, elapsed, duration));
        }

        if (elapsed > duration) {
            if (typeof callback === 'function') {
                callback(el);
            }
        } else {
            requestAnimationFrame(step);
        }
    }
    step();
}

export default smoothScroll;
export { getTop };
