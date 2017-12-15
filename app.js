var savePath = './';

var cookies = 'imooc_uuid=19303ada-3074-4ec4-a5e3-6e524f3eaac6; imooc_isnew=2; imooc_isnew_ct=1504169147; Hm_lvt_f0cfcccd7b1393990c78efdeebff3968=1513294117,1513294122,1513294229,1513296417; PHPSESSID=0lc3r8udq6j1miv34ehbi56n75; cvde=5a32f5cdc09cf-56; IMCDNS=0; Hm_lpvt_f0cfcccd7b1393990c78efdeebff3968=1513296417; login_username=49Fgso1VS5omny5k944kyx3p1wR9LbQ0Skde5ws0ZV0%3D; urlcookie=http%3A%2F%2Fwww.imooc.com%2Flearn%2F441; loginstate=1; apsid=Y2MGFlYmExODFkMzllOTQyYjRhMjA2ZWRiNDM4NDUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANjI1NDk3NgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABoYWNrZXJzX2NuQDEyNi5jb20AAAAAAAAAAAAAAAAAADhlMDhlY2ZlNDMxMTUyZmFmODJjNzExZjBlMDQxYWRhGwkzWhsJM1o%3DZT; last_login_username=hackers_cn%40126.com';

var superagent = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');

var courseId = process.argv.splice(2, 1);

var courseTitle = '';
var courseTotalCount = 0;
var finishCount = 0;


superagent
    .get('www.imooc.com/learn/' + courseId)
    .set(headers)
    .end(function(err, res) {

        var $ = cheerio.load(res.text);

        $('.course-infos .hd').find('h2').each(function(item) {
            courseTitle = $(this).text();
        })

        $('.chapter').each(function(item) {

            var videos = $(this).find('.video').children('li')

            videos.each(function(item) {
                var video = $(this).find('a')
                var filename = video.text().replace(/(^\s+)|(\s+$)/g,"");
                var id = video.attr('href').split('video/')[1]
                if (!id) {
                    console.log('Skip downloading: ' + filename)
                }else {

                    
                    getMovieUrl(id, function(url) {

                        courseTotalCount ++;

                        
                        download(url, filename, function(_filename) {
                            finishCount++;
                            console.log('Video number:' + finishCount + _filename + 'download complete')
                        })
                    })
                }
            })
        })
})

// Begin downloading
var download = function(url, filename, callback) {

    filename = filename.replace(/\(.*\)/,'') + '.mp4';

    var dirPath = savePath + courseTitle + '/'
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    console.log('Begin downloading video number:' + courseTotalCount + filename + ' address: ' + url);
    var writeStream = fs.createWriteStream(dirPath + filename);
    writeStream.on('close', function() {

        callback(filename);
    })

    var req = superagent.get(url)
    req.pipe(writeStream);

}


// Get download address
var getMovieUrl = function(id, callback) {
    superagent.get('http://www.imooc.com/course/ajaxmediainfo/?mid=' + id + '&mode=flash')
        .end(function(err, res) {
            var url = JSON.parse(res.text);

            if(url.result == 0) {
                url = url.data.result.mpath[0];
                callback(url);
            }
        })
}

var headers = {
    "Cache-Control": "max-age=0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Referer": "http://www.imooc.com/",
    "Accept-Encoding": "gzip, deflate, sdch",
    "Accept-Language": "zh-CN,zh;q=0.8",
    "Cookie": cookies
};

