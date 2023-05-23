import React, { lazy, Suspense } from 'react';

const LazyUserInfo = lazy(() => import('./UserInfo'));

const UserInfo = props => (
  <Suspense fallback={null}>
    <LazyUserInfo {...props} />
  </Suspense>
);

export default UserInfo;
