const express=require("express");
const app=express();
const mongoose=require("mongoose");
const _=require("lodash");

const date=require(__dirname+"/date.js");

mongoose.connect("mongodb+srv://admin-kalyan:nagarajukalyan@cluster0.f0al2wx.mongodb.net/todolistDB");

const itemsSchema= {
    name: String
};

const Item= mongoose.model("Item", itemsSchema);
const item1= new Item({
    name: "Play Cricket"
});
const item2= new Item({ 
    name: "Eat Food"
});
const item3= new Item({
    name: "CODE CODE CODE!"
});

const listSchema={
    name: String,
    items: [itemsSchema]
};
const defaultItems=[item1, item2, item3];
const List = mongoose.model("List", listSchema);


const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get("/", function(req, res){
    Item.find({},function(err, result){
        if(result.length===0){
            
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log("Error! "+err);
                }else{
                    console.log("Success!");
                }
            });
        }

        res.render("list", {listTitle: "Today", newlist: result});
    });
    
});

app.post("/", function(req, res){
    const itemName=req.body.newItem;
    const listName=req.body.list;
    const item = new Item({
        name: itemName
    });
    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName}, function(err, foundList){
            if(!err){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+listName);
            }   
        });
    }
    
});

app.post("/delete", function(req, res){
    const checkboxId=req.body.checkbox;
    const listName=req.body.listName;
        if(listName==="Today"){
            Item.findByIdAndRemove(checkboxId, function(err){
                if(err){console.log(err);}
                else{console.log("deleted successfully");}
                res.redirect("/");
            });
        }
        else{
            List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checkboxId}}}, function(err, result){
                if(!err){
                    res.redirect("/"+listName);
                }
            });
        }

});

app.get("/:listName",function(req, res){
    const listname= _.capitalize(req.params.listName);
    
    List.findOne({name: listname}, function(err, foundlist){
        if(!err){
            if(!foundlist){
                const list =new List({
                    name: listname,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+listname);
            }
            else{
                res.render("list", {listTitle: foundlist.name, newlist:foundlist.items});
            }
        }
    });
    
});

app.get("/about", function(req, res){
    res.render("about");
});

app.get("/work", function(req, res){
    res.render("list", {listTitle: "Work list", newlist: workitems});
});

app.listen(3000, function(){
    console.log("Server is running on port 3000");
});