$("#bReplace").click(function() {
  let text = $("#text").val();
  let replaceOrg = $("#replaceText").val();
  let replaceNew = $("#replacementText").val();
  let output = "";
  let testMatch = "";
  let replaceOrgRegex = new RegExp(replaceOrg, "g");
  output = text.replace(replaceOrgRegex, replaceNew);
  output = output.replace(/\\n/g, "\n");
  let n = replaceNew.split('\\i').length;
  let o = output.split('\\i').length;
  for (let i = 0; i < o; i++) {
    output = output.replace(/\\i/, i);
  }
  $("#output").val(output);
  $("#output").css('display', 'block');
});
