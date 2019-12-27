// 文档https://segmentfault.com/a/1190000014342764
import React from 'react';
import { Modal } from 'antd';
import {BrowserRouter as Router,Route,Link,Switch,Prompt,useParams,NavLink,useRouteMatch,Redirect,useHistory,useLocation} from 'react-router-dom'
function BasicExp() {
  // 如果用户浏览器不支持history时的app响应行为
  const supportHistory = 'pushState' in window.history
  // 如果要使用该函数，再Router中不允许使用Route，否则不生效，这里主要是用来阻止默认
  // message来自于prompt，callback来自于弹窗的按钮回调
  const getConfirmation = (message, callback) => {
    Modal.confirm({
      title: message,
      content: '',
      okText: '离开',
      cancelText: '取消',
      onOk() {
        callback(true);
      },
      onCancel() {
        callback(false);
      },
    });
  }
  // 通过注册ref获取Link组件
  const refCb = (node)=>{
    console.log(node)
  }
  // 当一个链接被导航时高亮显示
  const activeStyle = {
    color:'red'
  }
  // 是否激活当前导航，如果给定了该函数，则必须返回true或false
  const validateActive = ()=>{
    console.log('是否激活当前当航,只能控制样式，导航依然会继续走下去，可配合getConfirmation使用')
    // return false
  }
  return (
    // router组件会监听子组件，当存在可识别的路由组件时会进行解析,每一次导航都会被Router监听到
    // 当进行路由拆分时可以给Router定义basename属性，这相当于一个别名，再当前路由内的所有link都将被增加统一的basename前缀
    // forceRefresh=true在不支持h5的history模式的浏览器中，每一次导航都刷新整个页面
    // getUserConfirmation主要用来修改prompt的默认弹窗样式
    // 可以利用keyLength来强制刷新页面，多见于按需设置
    <>
      <Router
        basename='/api'
        forceRefresh={!supportHistory}
        getUserConfirmation={getConfirmation}
      >
        {/* <Prompt></Prompt> */}
        <div>
          <ul>
            <li>
              {/* 路由嵌套 */}
              <Link to="/">Nesting</Link>
            </li>
            <li>
              {/* 如果link组件不包含component选项且无route，那么会查找switch并找到后转发 */}
              <Link to="/about">About</Link>
            </li>
            <li>
              {/* 
                to接收字符串或对象{
                  pathname:路径
                  search:参数
                  hash：hash
                  state：存储到location的额外状态数据
                }
                replace:是否想history中添加而不是替换，为true时无法返回
                innerRef：注册引用
                others
              */}
              <Link 
                to={{
                  pathname:"/about/k",
                  search:'?sort=name',
                  hash:'#topic',
                  state:{
                    from_page:1
                  }
                }}
                innerRef={refCb}
              >AboutK</Link>
            </li>
            <li>
              {/* 
                如果不添加额外的属性，那么navLink的行为和link是一致的
                activeClassName和activeStyle均为导航激活时显示的样式信息
                exact绝对匹配
                isActive做更多的激活验证，配合getUserConfirmation会更好
                location确认激活的url地址
              */}
              <NavLink 
                to="/dashboard"
                activeClassName='active'
                activeStyle={activeStyle}
                isActive={validateActive}
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              {/* 重定向和编程式导航 */}
              <Link to="/redirect">Redirect</Link>
            </li>
          </ul>
        </div>
        <hr/>
        {/* 当Link组件不包含component定义时，会转发给内部的switch组件进行跳转,switch只会匹配一个，这个和js的switch机制是一致的 */}
        <Switch>
            {/* 获取路由参数 */}
            <Route path='/about/:id' children={<GetParams/>}></Route>
            {/* 
              path接收字符串或字符串数组 
              exact用于精确匹配
            */}
              <Route exact path='/'>
                  <Nesting></Nesting>
              </Route>
              <Route exact path='/about'>
                  <About></About>
              </Route>
              <Route exact path='/dashboard'>
                  <Dashboard></Dashboard>
              </Route> 
              <Route  path='/redirect'>
                  <Redirec></Redirec>
              </Route>
        </Switch>
      </Router>
    </>
  );
}


// 这是一个嵌套路由，在被嵌套的路由内部是不需要定义Router的
function Nesting(){
  // 需要借助useRouteMatch获取父路由信息
  let {path,url} = useRouteMatch()
  return(
    <>
      <h2>嵌套路由</h2>
      <ul>
        <li>
          <Link to={ `${url}next1`}>nest_one</Link>
        </li>
        <li>
          <Link to={ `${url}next2`}>nest_two</Link>
        </li>
      </ul>
      <Switch>
        {/* 当匹配到link时，此时的path已经是修改后的路径信息了 */}
        <Route exact path={path}>
          <h3>请选择</h3>
        </Route>
      </Switch>
    </>
  )
}
// 这里定义的是路由组件
function About(){
  return(
    <>
      <Prompt message={()=>{
        let is_next_router = 1
        return is_next_router?'如果是字符串则提示用户，否则直接跳转':true
      }}></Prompt>
      about
    </>
  )
}
function Dashboard(){
  return(
    <>
      dashboard
    </>
  )
}
// 使用useParams方法可以获取到url中的动态参数
function GetParams(){
  // 路由的参数对象
  let {id} = useParams()
  return(
    <>
      <h3>id:{id}</h3>
    </>
  )
}
// 重定向和编程式导航
function Redirec(){
  let {url,path} = useRouteMatch()
  return(
    <>
      <AuthButton />
      <ul>
        <li>
          <Link to={`${url}/public`}>public</Link>
        </li>
        <li>
          <Link to={`${url}/protected`}>prot</Link>
        </li>
      </ul>
      <hr></hr>
      <Switch>
        {/* 
          如果父路由使用了exact，那么这里的路由跳转到空404，因为/redirect/public不会被匹配 
          当有所匹配时，会渲染route的子组件
          有三种渲染方式（一个route择其一）
                    component --匹配后每次都会重新创建组件
                    render    --推荐
                    children  --无视路径匹配，每次都会重新创建，在组件的出场入场动画中大有作用
                    每一种方式都携带三个属性：match、location、history
          path：匹配的路径
          exact
          strict  配合exact可以做到不允许url路径以/结尾
          location
          sensitive 匹配路径是否区分大小写
        */}
        <Route exact path={`${path}/public`}>
          <PublicPage></PublicPage>
        </Route>
        <Route exact path={`${path}/login`}>
          <LoginPage></LoginPage>
        </Route>
        <PrivateRoute path={`${path}/protected`}>
          <ProtectedPage />
        </PrivateRoute>
      </Switch>
    </>
  )

} 
const fakeAuth = {
  isAuthenticated: true,
  authenticate(cb) {
    fakeAuth.isAuthenticated = true;
    setTimeout(cb, 100); // fake async
  },
  signout(cb) {
    fakeAuth.isAuthenticated = false;
    setTimeout(cb, 100);
  }
};

function AuthButton() {
  let history = useHistory();

  return fakeAuth.isAuthenticated ? (
    <p>
      Welcome!{" "}
      <button
        onClick={() => {
          fakeAuth.signout(() => history.push("/"));
        }}
      >
        Sign out
      </button>
    </p>
  ) : (
    <p>You are not logged in.</p>
  );
}

function PrivateRoute({ children,match, ...rest }) {
  // 每一个route在渲染时会接收来自父元素的props：children、path、location、coputedMatch
  console.log({ children, ...rest })
  return (
    // 如果给Route提供了render函数，那就不需要提供子组件啦
    <Route
      {...rest}
      render={({ location }) =>
        fakeAuth.isAuthenticated ? (
          children
        ) : (
          // to:重定向的地址{
          //    pathname:'/login'
          //    search:'?key=val',
          //    state:{key:val}   state对象可以在重定向到的组件中通过location获取
          // }
          // 默认使用的是replace，可以指定push改变redirect的默认行为
          // from属性必须用在switch中，可以根据匹配参数进行重定向，from所匹配的路由参数必须是在to中使用到的
          //      form相当于route中的path
          // exact完全匹配
          // strict严格匹配
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
            push
          />
        )
      }
    />
  );
}

function PublicPage(props) {
  return <h3>Public</h3>;
}

function ProtectedPage() {
  return <h3>Protected</h3>;
}

function LoginPage() {
  let history = useHistory();
  let location = useLocation();

  let { from } = location.state || { from: { pathname: "/" } };
  let login = () => {
    fakeAuth.authenticate(() => {
      history.replace(from);
    });
  };

  return (
    <div>
      <p>You must log in to view the page at {from.pathname}</p>
      <button onClick={login}>Log in</button>
    </div>
  );
}
export default BasicExp;
