import React from 'react';
import { ReactComponent as Flag } from '../../img/flag.svg';
import './UserInfo.scss';

const UserInfo = (props) => {
  const p = props, data = props.data;
  return props.data ? (
    <div className={`user-info ${p.you ? 'you' : ''} ${data.isLight ? 'light' : 'dark'}`}>
      <div>
        <h1>{data.nickname}</h1>
        {
          props.you && <button type="button" className="surrender" onClick={() => props.handleDone('LOGOUT')}><Flag /> Resign</button>
        }
      </div>
      {props.children}
    </div>
  ) : ""
};

export default UserInfo;
