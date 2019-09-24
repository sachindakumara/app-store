import * as loginActions from './authentication.actions';
import { LoginMenuActionTypes } from './authentication.models';
import { AuthState } from './authentication.models';
import { createReducer, on } from '@ngrx/store';

const defaultMenu = [
    { name: 'Login', action: LoginMenuActionTypes.LOGIN },
    { name: 'Sign up', action: LoginMenuActionTypes.SIGNUP },
    { name: 'Help', action: LoginMenuActionTypes.HELP }
];

const loggedInMenu = [
    { name: 'My Accunt', action: LoginMenuActionTypes.MYACCOUNT },
    { name: 'Logout', action: LoginMenuActionTypes.LOGOUT }
];

const initState: AuthState = {
    loginData: null,
    menuData: defaultMenu,
    lastAuthRequiredRoute: null,
    registeredAppData: null,
    tokenDetails: null
};


const _authReducer = createReducer(initState,

    on(loginActions.LoginSuccessAction, (state, { payload }) => ({
        ...state, loginData: payload, menuData: loggedInMenu
    })),

    on(loginActions.DoLogoutSuccessAction, (state, { }) => ({
        ...state, loginData: null, registeredAppData: null, tokenDetails: null, menuData: defaultMenu
    })),

    on(loginActions.SetLastAuthRequiredRouteAction, (state, { payload }) => ({
        ...state, lastAuthRequiredRoute: payload
    })),

    on(loginActions.ClientRegistrationSuccessAction, (state, { payload }) => ({
        ...state, registeredAppData: payload
    })),

    on(loginActions.TokenGenerationSuccessAction, (state, { payload }) => ({
        ...state, tokenDetails: payload
    }))
);

export function authReducer(state, action) {
    return _authReducer(state, action);
}