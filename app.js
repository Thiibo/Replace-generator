let _outputOpen = false;
$('#repeat').prop("checked", false);
let _repeat = false;
let _infoPanel = false;
$("#info").click(function() {
  $("#infoPanel").toggleClass("open");
});
$("#bReplace").click(function() {
  let text = $("#text").val();
  let replaceOrg = $("#replaceText").val();
  let replaceNew = $("#replacementText").val();
  let output = "";
  let replaceOrgRegex = new RegExp(replaceOrg, "g");
  output = text.replace(replaceOrgRegex, replaceNew);
  output = output.replace(/\\n/g, "\n");
  let n = replaceNew.split('\\i').length;
  let o = output.split('\\i').length;
  let outputCopy = output;
  output = output.replace(/\\i/, 1);
  let repeat = _repeat ? $("#repeatX").val() : 0;
  if (repeat > 0) {
    for (let i = 2; i - 1 < repeat; i++) {
      output = output + outputCopy.replace(/\\i/, i);
    }
  }
  if (_outputOpen) {
    $("#output").animate({"height": 20}, 100, function() {
      $("#output").val(output);
    }).delay(300);
  } else {
    $("#output").val(output);
  }
  $("#output").css('display', 'block');
  $("#output").animate({"height": 160}, 300);
  _outputOpen = true;
});
$("#repeat").click(function() {
  _repeat = !_repeat;
  if (_repeat) {
    $("#repeatX").animate({"width": 60, "opacity": 1}, 400);
  } else {
    $("#repeatX").animate({"width": 0, "opacity": 0}, 400);
  }
});
