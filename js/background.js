let dragging = false

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