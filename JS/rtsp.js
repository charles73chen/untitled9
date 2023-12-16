function p1() {
    if ($crar.val() == '0') {

    } else {
        $.LoadingOverlay("show");
        startDate = moment();;
        撥放摄影機();
        $('#ttime').val("")
    }


}

function p3(){
    startDate = moment();;
    var arr = $('#crar option')
    console.log(arr.length);
    var i=1;
    document.getElementById("crar").selectedIndex=0
    撥放摄影機();
    setInterval(function (){
        //console.log(arr[i]);
        startDate = moment();;
        document.getElementById("crar").selectedIndex=i;
        撥放摄影機();
        i++;
        console.log(i);
        if(i>=arr.length)
            i=0;
    },30000)
}

function p2() {
    if (new Date($('#ttime').val()).getTime() < new Date().getTime()) {
            $.LoadingOverlay("show");
            startDate = moment();;
            撥放摄影機(new Date($('#ttime').val()));
        } else {
            alert("不可大於現在!");
        }
}