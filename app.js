Array.prototype.insert = function ( index, item ) {this.splice( index, 0, item );};
Array.prototype.pop = function ( index ) {this.splice( index, 1 );};
String.prototype.indexOfRegex = function(regex){ //Thanks to pmrotule @ https://stackoverflow.com/a/21420210
  var match = this.match(regex);
  return match ? this.indexOf(match[0]) : -1;
}
String.prototype.lastIndexOfRegex = function(regex){ //Thanks to pmrotule @ https://stackoverflow.com/a/21420210
  var match = this.match(regex);
  return match ? this.lastIndexOf(match[match.length-1]) : -1;
}

let replaceRange = (str, start, stop, replaceWith) => str.substring(0, start) + replaceWith + str.substring(stop + 1);
let lists = [[""], [""], [""], [""], [""], [""]];
const listNames = ["u", "v", "w", "x", "y", "z"]
let listOpen = 0;
let output = "";
let _outputOpen = false;
let outputOpenHeight = 150;
let _repeat = false;

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

function updateList(l, items) {
  lists[l] = [];
  for (let i = 0; i < items.length; i++) {
    lists[l].push(items[i]);
  }
  loadList(l);
}

function download(el, filename, text) {
  el.attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  el.attr('download', filename);
}

function error(str) {
  $("#output").addClass("error");
  output = str;
  console.error(str);
}

function evalMathCall(str, indexMathStart) {
  if (indexMathStart + 1 > str.length) {
    error("Missing '()' for math call at position " + indexMathStart);
    return false;
  }
  if (str[indexMathStart + 2] !== "(") {
    error("Missing '(' for math call at position " + indexMathStart);
    return false;
  }
  indexMathStop = indexMathStart + 2;
  let p = 1;
  while (p != 0) { // Find end of math call
    indexMathStop++;
    console.log(str[indexMathStop]);
    switch (str[indexMathStop]) {
      case '(':
        p++;
        break;
      case ')':
        p--;
        break;
      case void(0):
        error("Missing ')' for math call at position " + indexMathStart);
        return false;
    }
  }
  let mathStr = str.substring(indexMathStart + 3, indexMathStop);
  if (mathStr === "") {
    error("Empty math call at position " + indexMathStart);
    return false;
  }
  let indexNestedMathCall = mathStr.indexOf("\\m");
  if (indexNestedMathCall !== -1) {
    error("Found nested math call at position " + indexNestedMathCall + " for math call at position " + indexMathStart + ". This is not allowed. If this is not the problem, check for missing ')' in the call.")
    return false;
  }
  console.log("mathStr = " + mathStr);
  mathStr = mathStr.replace(/\\/, "").replace(/\i/, "oI").replace(/\c/, "oC").replace(/\o/, "oO");
  if (/[^\d\s]+\(/.test(mathStr)) {
    error("Invalid math call at position " + indexMathStart + ": functions can't be used in math calls");
    return false;
  } else if (!/^[(oI)(oC)(oO)\d\(\)\+\-\*\/(\d\.\d)\s]*$/.test(mathStr)) {
    error("Invalid math call at position " + indexMathStart + ": invalid character(s)");
    return false;
  } else {
    //Math allowed
    console.log("Math is allowed!");
    return eval(mathStr);
  }
}

function replace() {
  $("#output").removeClass("error");
  let text = $("#text").val();
  let replaceOrg = $("#replaceText").val();
  let replaceNew = $("#replacementText").val();
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
  // Replace lists
  let indexListValueStart = output.indexOfRegex(/(\\[uvwxyz])/, 0);
  indexMathStop = 0;
  while (indexListValueStart != -1) {
    console.log(indexListValueStart);
    let listValueIndex = evalMathCall(output, indexListValueStart);
    if (listValueIndex !== false) {
      let listValueList = listNames.indexOf(output[indexListValueStart + 1]);
      let listValueResult = lists[listValueList][listValueIndex];
      if (typeof listValueResult === 'undefined') {
        error("Index " + listValueIndex + " for list \\" + listNames[listValueList] + " out of range on position " + indexListValueStart);
        return false;
      } else {
        output = replaceRange(output, indexListValueStart, indexMathStop, listValueResult);
      }
      console.log(listValueResult);
      console.log(indexMathStop);
      indexListValueStart = output.indexOfRegex(/(\\[uvwxyz])/, indexListValueStart + 1);
    } else {
      indexListValueStart = -1;
    }
  }
  // Evaluate math
  let indexMathStart = output.indexOf("\\m");
  indexMathStop = 0;
  while (indexMathStart != -1) {
    console.log(indexMathStart);
    let mathResult = evalMathCall(output, indexMathStart);
    console.log(mathResult);
    console.log(indexMathStop);
    if (mathResult !== false) {
      output = replaceRange(output, indexMathStart, indexMathStop, mathResult);
    }
    indexMathStart = output.indexOf("\\m", indexMathStart + 1);
  }
  output = output.replace(//g, "\\");
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
}

$(document).ready(function() {
  let _lPanelMoreOpen = false;
  $("#bListsPanelMore").click(function() {
    _lPanelMoreOpen = !_lPanelMoreOpen;
    $(this).toggleClass("open");
    $("#listsPanelMore").toggleClass("open");
  });
  $("#bListsImport").click(function() {
    $("#bListsImportRef").click();
  });
  $("#bListsImportRef").change(function() {
    if (this.files && this.files[0]) {
      let myFile = this.files[0];
      let myFileExtension = myFile.name.slice(myFile.name.lastIndexOf('.') + 1);
      let reader = new FileReader();
      reader.addEventListener('load', function(evt) {
        let myFileData = evt.target.result;
        let myFileLines = myFileData.split(/\n/g);
        updateList(listOpen, myFileLines);
      });
      reader.readAsBinaryString(myFile);
    }
  });
  $("#bListsExport").click(function() {
    download($("#listsExportLink"), "list", lists[listOpen].join("\n"));
  });
  $("#bListsChangeType").click(function() {
    $("#blackFadeListsPanel").css("display", "flex");
    $("#blackFadeListsPanel").animate({opacity: 1}, 300);
  });
  $("#listsPanelClose").click(function() {
    $("#listsPanel").animate({left: "-400px", opacity: 0}, 600);
    $("body").css("overflow-y", "auto");
    $("#blackFadePage").animate({opacity: 0}, 500, function() {
      $("#blackFadePage").css("display", "none");
    });
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
    $("#blackFadePage").css("display", "block");
    $("body").css("overflow-y", "hidden");
    $("#blackFadePage").animate({opacity: 1}, 300);
    loadList(listOpen);
  });

  $('#repeat').prop("checked", false);
  let _infoPanel = false;
  $("#info").click(function() {
    $("#infoPanel").toggleClass("open");
  });
  $("#bReplace").click(function() {
    replace();
  });
  $("#repeat").click(function() {
    _repeat = !_repeat;
    $("#repeatSettings").toggleClass("open");
  });
});
