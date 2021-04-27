require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3030;
const pg = require('pg');
const superagent = require('superagent');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
app.use(cors());
app.use(express.urlencoded({ extended: true }));
const methodOverride = require('method-override');
const { readdirSync } = require('fs');
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

// const client = new pg.Client(process.env.DATABASE_URL);



app.get('/', homePage);
app.get('/ProductByPrice', productByPrice);
app.get('/MaybellineProducts', maybellineProducts);
app.post('/MyProducts', myProducts);
app.get('/MyCard', myCard);
app.get('/ProductDetails/:id', productDetails);
app.delete('/Delete/:id', deleteProcuct);
app.put('/Update/:id', UpdateProcuct);


function UpdateProcuct (req,res)
{
	let {pname,pimg,pprice,pdesc} = req.body;
	let sql = `UPDATE makeups SET name=$1,img=$2,price=$3,description=$4 WHERE id=$5;`;
	let safeValues = [pname,pimg,pprice,pdesc,req.params.id];
	client.query(sql, safeValues).then(result => {
		res.redirect(`/ProductDetails/${req.params.id}`);
	});
}
function deleteProcuct (req,res)
{
	let sql=`DELETE FROM makeups WHERE id=$1`;
	let safeValues=[req.params.id];
	client.query(sql,safeValues).then(result=>
		{
			res.redirect('/MyCard');
		});
}
function productDetails(req,res)
{
	let SQL='select * FROM makeups WHERE id=$1';
	let safeValues=[req.params.id];
	client.query(SQL,safeValues).then(result=>
		{
			res.render('ProductDetails.ejs', { data: result.rows });
		});
}

function myCard(req, res) {

	let SQL='select * FROM makeups';
	client.query(SQL)
	.then(result=>
		{
			res.render('MyCard.ejs', { data: result.rows });
		});

	
}



function myProducts(req, res) {

	let {pname,pimg,pprice,pdesc} = req.body;
	let sql = `INSERT INTO makeups (name,img,price,description) VALUES ($1,$2,$3,$4) RETURNING *;`;
	let safeValues = [pname,pimg,pprice,pdesc];
	client.query(sql, safeValues).then(result => {
		res.redirect('/MyCard');
	});
	
}


function MaybellineProducts(data) {
	this.img = data.image_link;
	this.name = data.name;
	this.price = data.price;
	this.description = data.description;
}

function maybellineProducts(req, res) {
	superagent.get(`http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline`)
		.then(response => {
			let newObjectMakeUp = response.body.map(data => {
				return new MaybellineProducts(data)
			});
			res.render('MaybellineProducts', { data: newObjectMakeUp });
		})
}



function productByPrice(req, res) {

	//maybelline

	superagent.get(`http://makeup-api.herokuapp.com/api/v1/products.json?brand=${req.query.Pname}&price_greater_than=${req.query.Pcmax}&price_less_than=${req.query.Pcmin}`)
		.then(response => {
			console.log(response.body)
			res.render('ProductByPrice', { data: response.body });
		})

}
function homePage(req, res) {

	res.render('HomePage.ejs');
}



client.connect().then(() => {
	app.listen(PORT, () => { console.log(`app lestin at : ${PORT}`) });
});