function updateListNumbering() {
  let l = $("#listNumbering").children()
  for (let i = 1; i < l.length + 1; i++) {
    l[i-1].innerHTML = i;
  }
}

$(document).ready(function() {
  let listOpen = 0;
  $("#lists li").click(function() {
    $("#lists li").removeClass("selected");
    $(this).addClass("selected");
    listOpen = $(this).index();
  });
  $("body").on("keypress", ".listItem", function(e) {
    let key = e.keyCode || e.charCode;
    let sel = window.getSelection();
    if(key == 13) {
      let el = '<pre class="listItem" contenteditable="true">' + $(this).html().substring(sel.anchorOffset, $(this).html().length) + '</pre>';
      $(this).after(el);
      $(this).html($(this).html().substring(0, sel.anchorOffset));
      $(this).next().focus();
      el = '<pre class="listNumber">' + ($(this).index() + 2) + '</pre>';
      $("#listNumbering").children().eq($(this).index()).after(el);
      updateListNumbering();
      return false;
    } else {
      return true;
    }
  });
  $("body").on("keydown", ".listItem", function(e) {
    let key = e.keyCode || e.charCode;
    let sel = window.getSelection();
    if(key == 8 && sel.anchorOffset == 0 && sel.focusOffset == 0)  {
      $("#listNumbering").children().eq($(this).index()).remove();
      $(this).prev().focus();
      console.log($(this).prev()[0]);
      console.log($(this).prev().html().length);
      let prevLen = $(this).prev().html() == "" ? 0 : $(this).prev().html().length - 2;
      $(this).prev().html($(this).prev().html() + $(this).html());
      $(this).prev().focus();
      sel.collapse($(this).prev()[0], prevLen);
      $(this).remove();
      updateListNumbering();
      return false;
    }
  });

  let _outputOpen = false;
  let outputOpenHeight = 150;
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
    let repeatInbetween = $("#repeatInbetween").val().replace(/\\n/g, "\n");
    output = text.replace(replaceOrgRegex, replaceNew);
    output = output.replace(/\\\\/g, "").replace(/\\n/g, "\n");
    let oC = output.split('\\c').length;
    for (let i = 1; i < oC + 1; i++) {
      output = output.replace(/\\c/, i);
      repeatInbetween = repeatInbetween.replace(/\\c/, i);
    }
    let outputCopy = output;
    let repeat = _repeat ? $("#repeatX").val() : 1;
    if (repeat > 0) {
      output = output.replace(/\\i/g, 1);
      for (let i = 2; i - 1 < repeat; i++) {
        output += _repeat ? repeatInbetween.replace(/\\i/g, i) : "";
        output += outputCopy.replace(/\\\\/g, "").replace(/\\i/g, i);
      }
    }
    let oO = output.split('\\o').length;
    for (let i = 1; i < oO + 1; i++) {
      output = output.replace(/\\o/, i);
    }
    output = output.replace(//g, "\\")
    if (_outputOpen) {
      outputOpenHeight = $("#output").height() + 20;
      $("#output").animate({"height": 20}, 100, function() {
        $("#output").val(output);
      }).delay(300);
    } else {
      $("#output").val(output);
    }
    $("#output").css('display', 'block');
    $("#output").animate({"height": outputOpenHeight}, 300);
    _outputOpen = true;
  });
  $("#repeat").click(function() {
    _repeat = !_repeat;
    $("#repeatSettings").toggleClass("open");
  });
});
