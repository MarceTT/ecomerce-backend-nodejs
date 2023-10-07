const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const cloudynaryUploadImg = async (fileToUpload) => {
    return new Promise((resolve) => {
        cloudinary.uploader.upload(fileToUpload, (result) => {
            resolve({
                url: result.secure_url,
                asset_id: result.asset_id,
                public_id: result.public_id,
            },{
                resource_type: "auto"
            })
        });
    });
}


const cloudynaryDeleteImg = async (public_id) => {
    return new Promise((resolve) => {
        cloudinary.uploader.destroy(public_id, (result) => {
            resolve(result);
        });
    });
}


module.exports = { cloudynaryUploadImg, cloudynaryDeleteImg };