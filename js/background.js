let dragging = false

// $('#background').css({
//   width: "auto",
//   height: Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)),
// });

$(function () {
  const target = $('#background');
  let width = window.innerWidth;
  let height = window.innerHeight;
  let alreadyRotated = 0;
  let fromDegree = 0;
  const calculateDegree = function (e) {
    let x = e.pageX;
    let y = e.pageY;
    let radians = Math.atan2(x - width / 2, y - height / 2);
    return (radians * (180 / Math.PI) * -1) + 90;
  }
  target.css('height', Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)));
  target.css('width', 'auto');
  target.css('top', target.height() / -2 + height / 2);
  target.css('left', target.width() / -2 + width / 2);

  $(document).mousedown(function (e) {
    dragging = true
    fromDegree = calculateDegree(e);
  })
  $(document).mouseup(function (e) {
    dragging = false
    alreadyRotated += calculateDegree(e) - fromDegree;
  })
  $(document).mousemove(function (e) {
    if (dragging) {
      let nowDegree = calculateDegree(e);
      target.css('-webkit-transform', 'rotate(' + (nowDegree - fromDegree + alreadyRotated) + 'deg)');
      target.css('-webkit-transform-origin', '50% 50%');

    }
  })
})