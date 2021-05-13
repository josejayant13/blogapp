
    var tables = $('table');
    
    var array=[];
    for(var j=0;j<tables.length;j++)
    {
        var table = tables[j];
        
        var obj={
            tableHeading: table.children[0].children[0].children[0].innerText
        
        };
        var len = table.children[1].children.length;
        var prop,value;
        for(i=0;i<len;i++){
            prop = table.children[1].children[i].children[0].innerText;
            value = table.children[1].children[i].children[1].innerText;
            obj[prop] = value;
        }
        array.push(obj);
        console.log(obj);
        var myJSON = JSON.stringify(obj);
        obj = {};
    }