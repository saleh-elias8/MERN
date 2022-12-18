const express = require('express')
const app = express()
const { MongoClient } =  require("mongodb")
const port = 8000


//Initialize middleware
//we use to have to install body parser but now it is a built in middleware
//function of express. It parses incoming JSON payload
app.use(express.json({ extended: false }))

const withDB = async(operations,res) => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017')
        const db = client.db("mernblog")
        await operations(db)
        client.close()
    } catch (error) {
        res.status(500).json({message:"Error connecting to database"})
    }
}

app.get('/api/articles/:name',async (req,res)=>{
    withDB (async (db) => {
    const articleName = req.params.name
    
    const articlesInfo = await db
        .collection("articles")
        .findOne({ name: articleName })
        res.status(200).json(articlesInfo)
    },res) 
    
})

app.post('/api/articles/:name/add-comments',(req,res)=>{
    const { username , text } = req.body
    const articleName = req.params.name
    // articlesInfo(articlesInfo[articleName]).comments.push({ username,text})
    // res.status(200).send(articlesInfo[articleName])
    withDB(async(db) => {
        const articlesInfo = await db
            .collection('articles')
            .findOne({name: articleName})
            await db.collection('articles').updateOne(
                { name: articleName},
                {
                    $set : {
                        comments: articlesInfo.comments.concat({ username, text }),
                    },
                }
        )
        const updateArticleInfo = await db.collection('articles').findOne({name: articleName})
        res.status(200).json(updateArticleInfo)
    },res)
})

app.listen(port, () => 
    console.log(`Example app listening on port ${port}`)
  )