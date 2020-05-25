const CRYPTO = require('crypto');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');
const SriPlugin = require('webpack-subresource-integrity');
const JavaScriptObfuscator = require('webpack-obfuscator');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const SHA256 = (str) => CRYPTO.createHash('sha256').update(str, 'utf8').digest('base64');
const sha256Str = SHA256('' + Date.now());

const PATHS = {
    src: path.join(__dirname, 'src'),
    dist: path.join(__dirname, 'dist')
};

const WEBPACK_MODES = {
    development: 'development',
    production: 'production'
};

module.exports = (env, {mode}) => {
    const devtool = mode === WEBPACK_MODES.development
        ? 'source-map'
        : void 0;

    return {
        devtool,
        entry: './src/index.js',
        output: {
            path: PATHS.dist,
            filename: '[name].[hash].js',
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    include: [PATHS.src],
                    enforce: 'post',
                    use: {
                        loader: 'obfuscator-loader',
                        options: {/* options here */}
                    }
                },
            ]
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    node_vendors: {
                        test: /node_modules/,
                        name: 'node_vendors',
                        chunks: 'all',
                        enforce: true
                    }
                }
            }
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: `${PATHS.src}/index.html`,
                filename: 'index.html',
                inject: 'body',
                meta: {
                    charset: 'UTF-8'
                }
            }),
            new JavaScriptObfuscator({
                rotateStringArray: true
            }, ['excluded_bundle_name.js']),
            new ScriptExtHtmlWebpackPlugin({
                custom: [{
                    test: /\.js$/,
                    attribute: 'nonce',
                    value: 'nonce-' + sha256Str
                }]
            }),
            // new HtmlWebpackExcludeAssetsPlugin(),
            new CspHtmlWebpackPlugin({
                'base-uri': '\'self\'',
                'object-src': '\'none\'',
                'script-src': ['\'self\'', '\'unsafe-eval\'', '\'nonce-' + sha256Str + '\''],
                'style-src': ['\'unsafe-inline\'', '\'self\'']
            }, {
                devAllowUnsafe: false,
                enabled: true,
                hashingMethod: 'sha256'
            }),
            new SriPlugin({
                hashFuncNames: ['sha256', 'sha384'],
                enabled: true
            }),
            new CleanWebpackPlugin()
        ]
    };
};

