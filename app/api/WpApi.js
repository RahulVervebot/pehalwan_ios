import { ApiConstants, baseURL } from './config';

var WPAPI = require( 'wpapi' );

export const WpApi = new WPAPI({
    endpoint: baseURL,
    username: ApiConstants.WpApi.username,
    password: ApiConstants.WpApi.password
});