Array.prototype.insert = function ( index, item ) {this.splice( index, 0, item );};
Array.prototype.pop = function ( index ) {this.splice( index, 1 );};
let lists = [[""], [""], [""]];
let listOpen = 0;

function loadList(l) {
  $("#listContent").html("");
  for (let i = 0; i < lists[l].length; i++) {
    $("#listContent").append(
      $('<li/>', {"class": "listItem"}).append(
        $('<label/>', {"for": "listValue-" + i, "class": "listValueLabel"}).append(i + ":")
      ).append(
        $('<input/>', {"id": "listValue-" + i, "class": "listValue", "type": "text"}).val(lists[l][i])
      ).append(
        $('<button/>', {"class": "listValueDelete"}).append("×")
      )
    );
  }
}

$(document).ready(function() {
  $("#listsPanelClose").click(function() {
    $("#listsPanel").animate({left: "-400px", opacity: 0}, 600);
  });
  $("#lists li").click(function() {
    $("#lists li").removeClass("selected");
    $(this).addClass("selected");
    listOpen = $(this).index();
    loadList(listOpen);
  });
  $("#listAddItem").click(function() {
    let n = lists[listOpen].length;
    $("#listContent").append(
      $('<li/>', {"class": "listItem"}).append(
        $('<label/>', {"for": "listValue-" + n, "class": "listValueLabel"}).append(n + ":")
      ).append(
        $('<input/>', {"id": "listValue-" + n, "class": "listValue", "type": "text"}).val(lists[listOpen][n])
      ).append(
        $('<button/>', {"class": "listValueDelete"}).append("×")
      )
    );
    lists[listOpen].push("");
    $("#listContent :last-child .listValue").focus();
  });
  $("body").on('change', '.listValue', function() {
    lists[listOpen][$(this).parent().index()] = $(this).val();
  });
  $("body").on('keypress', '.listValue', function(e) {
    let key = e.keyCode || e.charCode;
    if (key == 13) {
      $("#listAddItem").click();
      lists[listOpen].pop(-1);
      lists[listOpen].insert($(this).parent().index() + 1, "");
      for (let i = $(this).parent().index() + 1; i < lists[listOpen].length; i++) {
        $("#listContent").children().eq(i).children().eq(1).val(lists[listOpen][i]);
      }
      $(this).parent().next().children().eq(1).focus();
    }
  });
  $("body").on('keydown', '.listValue', function(e) {
    let key = e.keyCode || e.charCode;
    switch (key) {
      case 38:
        $(this).parent().prev().children().eq(1).focus();
        break;
      case 40:
        $(this).parent().next().children().eq(1).focus();
        break;
      default:

    }
  });
  $("body").on('click', '.listValueDelete', function() {
    lists[listOpen].pop($(this).parent().index());
    $(this).parent().remove();
    if (lists[listOpen].length == 0) {
      $("#listAddItem").click();
    } else {
      for (let i = $(this).parent().index(); i < lists[listOpen].length; i++) {
        $("#listContent").children().eq(i).children().eq(0).html(i + ":");
      }
    }
  });
  $("#listsPanelOpen").click(function() {
    $("#listsPanel").animate({left: "0", opacity: 1}, 400);
    loadList(listOpen);
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
