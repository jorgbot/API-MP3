const ytsr = require('ytsr');
const ytdl = require('ytdl-core');
const helper = require('../helpers/helper');
const request = require('request')
const ejs = require('ejs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const mime = require('mime');
const http = require('http');
const  ffmpeg = require('ffmpeg');
const fs = require('fs');
const { Converter } = require("ffmpeg-stream");
const converter = new Converter()
const { createReadStream, createWriteStream } = require("fs")


const videoController = {
     getVideoID(url){
        url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
     },
    getVideos(req,res){
        const options = {
            limit: 30,
        }
        let search_input = req.query.search;
        if(search_input && search_input.length)
        {
            search_input = decodeURIComponent(search_input)
            // check if search input is URL
            if(search_input && helper.isValidLink(search_input))
            {
                const videoID = videoController.getVideoID(search_input);
                if(videoID)
                {
                    // if yes get ID & set limit to 1
                    options.limit = 1;
                    search_input = videoID;
                }
            }
            // else search normaly
            ytsr.getFilters(search_input).then(filters_res=>{
                const filters = filters_res.get('Type').get('Video');
                ytsr(filters.url,options).then(data=>{
                    res.status(200).send(data);   
                })
            })
        }else{
            res.status(404).send({});
        }
        
    },

    getFormats(req,res){
        const {type,id} = req.params;
        const privateKey = helper.getPrivatekey(req.params);
        const url = `${privateKey}/${type}/${id}`;
        if(type.length){
            axios.get(url).then(data=>{
               const html = data.data;
               const $ = cheerio.load(html);
               const elements = $('a');
               const response = {};
               elements.each((i,e)=>{
                   const $child = $(e);
                   const info = helper.getVideoInfo($child,$);
                   const {format,size,quality,link} = info;
                   if(!response[type])
                   response[type] = [];
                   response[type].push({format,size,quality,link});
               })
               res.send(response);
            })  
        }else
        res.send({});
    },
   getVideoInfo(req,res){
        let id = req.params.id
        let formats = {}
        ytdl.getInfo(id).then(info=>{
            info.formats.forEach(e=>{
                if(!formats[e.container])
                formats[e.container] = []

                if(e.hasAudio && e.hasVideo)
                formats[e.container].push(e)

            })
            Object.keys(formats).forEach(key=>{
                if(!formats[key].length)
                delete formats[key];
            })
            res.status(200).send({info,formats})
        })
    },
    downloadFormat(req,res){
        let {url,ext,fileName} =  req.query
        url = Buffer.from(url,'base64').toString();
        url = decodeURIComponent(url);
        if(helper.isValidLink(url) && ext && fileName )
        {
           let finalName = fileName.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
           finalName = finalName.split(' ').join('_')+ '.' + ext;
           finalName = encodeURI(finalName)
           request(url).on('error',err=>{
                res.send(err)
            })
            .on("response", remoteRes => {
              remoteRes.headers["content-disposition"] = "attachment; filename="+finalName;
            }).pipe(res);
        }
        else
        res.status(404).send('File Not Found !')
    },
    
    shareVideo(req,res){
        const id = req.params.id;
        const redirect = req.query.redirect;
        if(id.length){
            ytdl.getInfo(id).then(info=>{
                const images = info.videoDetails.thumbnails ;
                const imageUrl = images.length ? images.pop().url : "#";
                ejs.renderFile(path.resolve(__dirname+'./../ejs/shareVideo.ejs')
                ,{data:info.videoDetails,redirect,imageUrl},{}, function (err, template) {
                if (err) {
                    throw err;
                } else {
                     res.end(template);
                }
             })     
             
            })
        }else{
            res.send({});
        }
    },
    renderPage(req,res){
        ejs.renderFile(path.resolve(__dirname+'./../views/index.html')
        ,{},{}, function (err, template) {
        if (err) {
            throw err;
        } else {
             res.end(template);
        }
     })  
    },

    async toMP3(req,res){
            var id = req.query.id; // extra param from front end
            var proc = new ffmpeg({source: stream,id});
            res.setHeader('Content-type', 'audio/mpeg');
             //set response headers
           
            const input = converter.createInputStream({
                f: "mp3",
                c:"mp4",
                e:"others"
                // acodec :"libmp3lame"
              })
            stream.pipe(input);

            converter
            .createOutputStream({
                f: "mp3",
                // acodec :"libmp3lame"
            })
            .pipe(res)
             converter.run().then(s=>{
                res.setHeader('Content-disposition', 'attachment; filename=' + title + '.mp3');
             })
        
      
        }


}

module.exports = videoController