const path = require("path");

module.exports = {
    alias: {
        "frappe/file_uploader/ImageCropper.vue": path.resolve(
            __dirname,
            "../your_custom_app/public/js/frappe/file_uploader/ImageCropper.vue"
        ),
    },
};