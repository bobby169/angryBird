import 'Box2D'
import Sprite from '../Sprite'
import hb from '../../hb'

class B2d {
  constructor(gravity = [0, 9.8], doSleep = true, drawScale = 30) {
    Box2D.Dynamics.b2World.prototype.LAddController = Box2D.Dynamics.b2World.prototype.AddController;
    Box2D.Dynamics.b2World.prototype.AddController = function (c) {
      let l = {}, k;
      for (k in c) {
        l[k] = c[k];
      }
      if (B2d) {
        B2d.m_controllerList = l;
      }
      return this.LAddController(c);
    };
    let i, j, b = Box2D, d,
      a = [b.Collision, b.Common, b.Common.Math, b.Dynamics, b.Dynamics.Contacts, b.Dynamics.Controllers, b.Dynamics.Joints, b.Collision.Shapes];
    for (i in a) {
      for (j in a[i]) {
        this[j] = a[i][j];
      }
    }
    this.stop = false;
    this.selectedBody = null;
    this.mouseJoint = null;
    this.mousePVec = null;
    this.contactListener = null;
    this.debug = false;
    this.drawScale = drawScale
    B2d.drawScale = this.drawScale;

    let gravityB2Vec2 = new this.b2Vec2(gravity[0], gravity[1]);
    this.world = new this.b2World(gravityB2Vec2, doSleep);
    this.removeList = [];
    if (hb.DEBUG) {
      let canvas = document.getElementsByTagName('canvas')[0];

      canvas.style.background = 'none';
      let debugCanvas = document.createElement('canvas');
      debugCanvas.width = canvas.width;
      debugCanvas.height = canvas.height;
      debugCanvas.id = 'debugCanvas';
      debugCanvas.style.outline = 'none';
      debugCanvas.style.position = 'absolute';
      debugCanvas.style.zIndex = 2;
      debugCanvas.style.pointerEvents = 'none';
      canvas.parentNode.insertBefore(debugCanvas, canvas);
      this.setDebug(debugCanvas.getContext('2d'));
    }
  }

  setDebug(debugSprite) {
    let debugDraw = new this.b2DebugDraw();
    debugDraw.SetSprite(debugSprite);
    debugDraw.SetDrawScale(this.drawScale);
    debugDraw.SetFillAlpha(0.2);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(this.b2DebugDraw.e_shapeBit | this.b2DebugDraw.e_jointBit);
    //Box2d.debugDraw = debugDraw;
    this.world.SetDebugDraw(debugDraw);
    this.debug = true;
  };

  /**
   * 为box2d加载事件监听器。
   * @method setEvent
   * @param {String} type 事件的类型。
   * 1、preSolve(b2Contactold,b2Manifold碰撞点信息)</td><td>碰撞前即将碰撞的时候。在两个FattenAABB的接触过程中持续调用,此时isTouching()返回false
   * 2、beginContact(b2Contact)</td><td>刚刚碰撞开始的时候会触发这个函数。此时isTouching()返回true
   * 3、postSolve(b2Contact,b2ContactImpulse)</td><td>碰撞的整个阶段会处理这个函数。在两个形状重叠消除之前持续调用,此时isTouching()返回true
   * 4、endContact(b2Contact)</td><td>碰撞结束的时候会触发这个函数。此时isTouching()返回false
   * @param {Function} listener 处理事件的侦听器函数。
   * 碰撞后的信息会记录在b2Contact对象中(高清探头，清晰记录碰撞发生的碰撞对象，碰撞位置),两个获取方法：一、GetContackList()，二、b2ContactListener回调函数中（推荐）
   * b2Contact.GetFixtureA();获取发生碰撞的第1个b2Fixture对象
   * b2Contact.GetFixtureB();获取发生碰撞的第2个b2Fixture对象
   * b2Contact.GetManifold();获取碰撞点信息
   * b2Contact.GetWorldManifold(worldManifold);将碰撞点转换成全局坐标，并保存到参数woldManifold对象中，如在碰撞点添加爆炸效果
   * b2Contact.IsTouching();碰撞双方的形状发生是否接触
   * b2Contact.IsEnabled();是否开启当前的b2Contact对象
   * b2Contact.SetEnabled(bool);设置当前b2Contact对象状态
   * b2Contact.IsSensor();此次碰撞是否为传感器
   * b2Contact.SetSensor(bool);设置此次碰撞为sensor
   * 如何获取两个碰撞的刚体b2Contact.GetFixtureA().GetBody().GetUserData().hit
   * 如何获取两个碰撞的刚体b2Contact.GetFixtureB().GetBody().GetUserData().hit
   * b2Contact.GetFixtureA().GetShape()获取形状
   */
  setEvent(type, fn) {
    if (!this.contactListener) {
      this.contactListener = new this.b2ContactListener();
      this.world.SetContactListener(this.contactListener);
    }
    switch (type) {
      case 'preSolve':
        //fn参数，contact:b2Contactold, old_Manifold:b2Manifold
        //在两个FattenAABB的接触过程中持续调用
        this.contactListener.PreSolve = fn;//潜在碰撞
        break;
      case 'beginContact':
        //fn参数，contact:b2Contact
        //两个形状首次接触时调用一次
        this.contactListener.BeginContact = fn;//常规碰撞
        break;
      case 'postSolve':
        //fn参数，contact:b2Contact, impulse:b2ContactImpulse
        //inpulse.normalImpulses[0]:垂直于碰撞面的冲量,碰撞后对碰撞物体所产生的伤害与冲量大小有关
        //两个形状接触整个过程都调用
        this.contactListener.PostSolve = fn;//碰撞修复,形状之间发生了重叠，但是刚体不能彼此穿过，所以碰撞后马上要进行刚体的坐标和速度进行修复
        break;
      case 'endContact':
        //fn参数，contact:b2Contact
        //两个形状首次分享时调用一次
        this.contactListener.EndContact = fn;//常规碰撞分离
        break;
      default:
        this.contactListener.BeginContact = fn;
    }
  };

  /**
   * 给两个物体添加焊接关节
   * 焊接关节相当于捆绑，就是将两个物体牢牢地绑在一起，使其成为一个物体。
   * @method setWeldJoint
   * @param {b2BodyDef} b2BodyDefA 表示捆绑对象物体A
   * @param {b2BodyDef} b2BodyDefB 表示捆绑对象物体B
   */
  setWeldJoint(A, B) {
    let j = new this.b2WeldJointDef();
    j.Initialize(B, A, B.GetWorldCenter());
    return this.world.CreateJoint(j);
  };

  /**
   * 给两个物体添加悬挂关节。
   * 悬挂关节类似于一个垂直的移动关节，它将一个物体悬挂到了另一物体上。
   * @method setLineJoint
   * @param {b2BodyDef} b2BodyDefA 表示对象物体A
   * @param {b2BodyDef} b2BodyDefB 表示对象物体B
   * @param {Array} vec 表示物体B相对与悬挂点的移动方向，这个悬挂点就是物体B的初始位置，vec是一个数组[x,y]，设置不同的比例，可以建立不同方向上的悬挂关节。这和移动关节比较类似，大家可以试着改变这个参数的值，来体验一下它们的具体区别
   * @param {Array} limits 表示移动的相对长度限制数组，这个数组的内容是：[正向最大长度,反向最大角度]，在这里它可以限制两个物体相对移动的最大长度
   * @param {Array} motors 表示马达数组，这个数组的内容是：[正向力度,反向力度]，这个马达可以给移动关节添加一个持续的力，比如在上面的例子中，如果将马达参数设置为[0,10]，你会发现，物体不是向下移动了，而是向上移动，即使你用鼠标将物体拖拽到下面，它也会因为马达的力而再次向上移动
   */
  setLineJoint(A, B, vec, t, m) {
    let wa = new this.b2Vec2(vec[0], vec[1]);
    let j = new this.b2LineJointDef();
    j.Initialize(A, B, B.GetWorldCenter(), wa);
    if (t == null) {
      j.enableLimit = false;
    } else {
      j.lowerTranslation = t[0];
      j.upperTranslation = t[1];
      j.enableLimit = true;
    }
    if (m == null) {
      j.enableMotor = false;
    } else {
      j.maxMotorForce = m[0];
      j.motorSpeed = m[1];
      j.enableMotor = true;
    }
    return this.world.CreateJoint(j);
  };

  /**
   * 添加齿轮关节。
   * 使用Box2d可以模拟齿轮功能，这样就可以轻松地建立复杂的机械模型等，齿轮关节相对来说稍微复杂一些，因为它需要结合旋转关节和移动关节。
   * @method setGearJoint
   * @param {b2BodyDef} b2BodyDefA 表示对象物体A
   * @param {b2BodyDef} b2BodyDefB 表示对象物体B
   * @param {float} ratio 表示齿轮的比例系数，这个数值越小，物体A旋转一周使得物体B移动的距离也就越大，如果这个值设置得很大，那么物体A旋转几周才能使B移动一段很短的距离
   * @param {JointDef} revoluteJointDef 齿轮关节中的物体A和轴心所建立的旋转关节
   * @param {JointDef} prismaticJointDef 齿轮关节中的物体B和齿轮轴心所建立的移动连接
   */
  setGearJoint(A, B, ra, r, p) {
    let j = new this.b2GearJointDef();
    j.joint1 = r;
    j.joint2 = p;
    j.bodyA = A;
    j.bodyB = B;
    j.ratio = ra * this.b2Settings.b2_pi / (300 / this.drawScale);
    return this.world.CreateJoint(j);
  };

  /**
   * 给两个物体添加移动关节。
   * 对于移动关节来说，它会有一个自由度，也就是说它限制了两个物体的移动范畴，即只能沿指定轴相对移动。
   * @method setPrismaticJoint
   * @param {b2BodyDef} b2BodyDefA 表示对象物体A
   * @param {b2BodyDef} b2BodyDefB 表示对象物体B
   * @param {Array} vec 表示物体A和物体B的相对移动方向，它是一个数组[x,y]，设置不同的比例，可以建立不同方向上的移动关节
   * @param {Array} limits 表示移动的相对长度限制数组，这个数组的内容是：[正向最大长度,反向最大角度]，在这里它可以限制两个物体相对移动的最大长度
   * @param {Array} motors 表示马达数组，这个数组的内容是：[正向力度,反向力度]，这个马达可以给移动关节添加一个持续的力。比如在上面的例子中，如果将马达参数设置为[0,10]，你会发现，物体不是向下移动了，而是向上移动，即使你用鼠标将物体拖拽到下面，它也会因为马达的力而再次向上移动
   */
  setPrismaticJoint(A, B, vec, t, m) {
    let wa = new this.b2Vec2(vec[0], vec[1]);
    let j = new this.b2PrismaticJointDef();
    j.Initialize(B, A, B.GetWorldCenter(), wa);
    if (t == null) {
      j.enableLimit = false;
    } else {
      j.lowerTranslation = t[0];
      j.upperTranslation = t[1];
      j.enableLimit = true;
    }
    if (m == null) {
      j.enableMotor = false;
    } else {
      j.maxMotorForce = m[0];
      j.motorSpeed = m[1];
      j.enableMotor = true;
    }
    return this.world.CreateJoint(j);
  };

  /**
   * 给两个物体添加旋转关节。
   * 旋转关节可以强制两个物体共享一个描点，这样就能使它们进行相对旋转。
   * @method setRevoluteJoint
   * @param {b2BodyDef} b2BodyDefA 表示对象物体A
   * @param {b2BodyDef} b2BodyDefB 表示对象物体B
   * @param {Array} limits 表示旋转角度限制数组，这个数组的内容是：[最小角度,最大角度]，它在这里可以限制旋转关节旋转的角度
   * @param {Array} motors 表示马达数组，这个数组的内容是：[力度,速度]，马达可以有很多用途，在这里，它可以是关节自动进行旋转
   */
  setRevoluteJoint(A, B, a, m) {
    let j = new this.b2RevoluteJointDef();
    j.Initialize(A, B, B.GetWorldCenter());
    if (a == null) {
      j.enableLimit = false;
    } else {
      j.lowerAngle = a[0] * this.b2Settings.b2_pi / 180;
      j.upperAngle = a[1] * this.b2Settings.b2_pi / 180;
      j.enableLimit = true;
    }
    if (m == null) {
      j.enableMotor = false;
    } else {
      j.maxMotorTorque = m[0];
      j.motorSpeed = m[1];
      j.enableMotor = true;
    }
    return this.world.CreateJoint(j);
  };

  /**
   * 给两个物体添加距离关节
   * 距离关节是一个最简单的关节，它约束了两个物体之间的距离，两个物体之间的距离关节一旦建立，它们的距离就将会固定住。当你拖拽其中一个物体，另一个物体为了保证距离固定不变，也会跟着移动起来。
   * @method setDistanceJoint
   * @param {b2BodyDef} b2BodyDefA 表示对象物体A
   * @param {b2BodyDef} b2BodyDefB 表示对象物体B
   */
  setDistanceJoint(A, B) {
    let j = new this.b2DistanceJointDef();
    j.Initialize(A, B, A.GetWorldCenter(), B.GetWorldCenter());
    return this.world.CreateJoint(j);
  };

  /**
   * 给两个物体添加滑轮关节。
   * 要滑轮关节，可以先创建一个滑轮，然后将两个物体通过一条“绳子”接通，当一个物体上升或者下降的时候，因为“绳子”的长短不变，另一个物体就会相应的下降或者上升。
   * @method setPulleyJoint
   * @param {b2BodyDef} b2BodyDefA 表示对象物体A
   * @param {b2BodyDef} b2BodyDefB 表示对象物体B
   * @param {Array} anchorA 表示物体A相关的控制参数数组，这个数组的内容是：[x,y,length]，使用setPulleyJoint建立滑轮关节的时候，会自动以物体本身的中心作为描点，anchorA数组的前两个元素，决定了关节被建立时物体相对于这个描点的位置，anchorA数组的最后一个元素，决定了左侧绳子的长度
   * @param {Array} anchorB 表示物体B相关的控制参数数组，该数组中各元素的含义同anchorA
   * @param {float} ratio 表示两边绳子的比例系数，比如在上面的例子中，如果将比例系数设置为2，那么左边的物体上升2的时候，右边物体只下降1
   */
  setPulleyJoint(A, B, vA, vB, ratio) {
    let a1 = A.GetWorldCenter();
    let a2 = B.GetWorldCenter();
    let g1 = new this.b2Vec2(a1.x + (vA[0] / this.drawScale), a1.y + (vA[1] / this.drawScale));
    let g2 = new this.b2Vec2(a2.x + (vB[0] / this.drawScale), a2.y + (vB[1] / this.drawScale));
    let j = new this.b2PulleyJointDef();
    j.Initialize(A, B, g1, g2, a1, a2, ratio);
    j.maxLengthA = vA[2] / this.drawScale;
    j.maxLengthB = vB[2] / this.drawScale;
    return this.world.CreateJoint(j);
  };

  addCircle(r, cx, cy, t, d, f, e) {
    this.bodyDef = new this.b2BodyDef;
    /*动态*/
    this.bodyDef.type = t;
    this.fixDef = new this.b2FixtureDef;
    /*密度*/
    this.fixDef.density = d;
    /*摩擦*/
    this.fixDef.friction = f;
    /*弹力*/
    this.fixDef.restitution = e;
    //fixDef中还保存了shape，相当于实现了物体材质特性相关的一些属性
    this.fixDef.shape = new this.b2CircleShape(r);
    //position:b2Vec2:刚体坐标。即刚体在b2World中的位置,同时也是刚体本地坐标系统的坐标原点。
    this.bodyDef.position.x = cx;
    this.bodyDef.position.y = cy;

    //用wold.CreateBody(bodyDef)返回一个b2Body
    let shape = this.world.CreateBody(this.bodyDef);
    //再用b2Body.CreateFixture(fixDef)
    shape.CreateFixture(this.fixDef);//c++版本好像是.CreateShape()返回的就是一个shape

    //shape.SetSleepingAllowed(true);
    return shape;
  };

  addPolygon(w, h, cx, cy, type, d, f, e) {
    this.bodyDef = new this.b2BodyDef;
    /*动态*/
    this.bodyDef.type = type;
    this.fixDef = new this.b2FixtureDef;
    /*密度*/
    this.fixDef.density = d;
    /*摩擦*/
    this.fixDef.friction = f;
    /*弹力*/
    this.fixDef.restitution = e;
    this.fixDef.shape = new this.b2PolygonShape;
    this.fixDef.shape.SetAsBox(w, h); //SetAsBox(hx:Number,hy:Number):void:将当前形状设置为半宽为hx,半高为hy的矩形。

    //position:b2Vec2:刚体坐标。即刚体在b2World中的位置,同时也是刚体本地坐标系统的坐标原点。
    this.bodyDef.position.x = cx;
    this.bodyDef.position.y = cy;

    //shape等于body
    let shape = this.world.CreateBody(this.bodyDef);
    shape.CreateFixture(this.fixDef);

    //shape.SetSleepingAllowed(true);
    return shape;
  };

  addVertices(vertices, type, d, f, e) {
    let i, l;
    this.bodyDef = new this.b2BodyDef;
    /*动态*/
    this.bodyDef.type = type;
    let shape = this.world.CreateBody(this.bodyDef);
    for (i = 0, l = vertices.length; i < l; i++) {
      this.createShapeAsArray(shape, vertices[i], type, d, f, e);
    }
    return shape;
  };

  createShapeAsArray(c, vertices, type, d, f, e) {
    let shape = new this.b2PolygonShape();
    let sv = this.createVerticesArray(vertices);
    shape.SetAsArray(sv, 0); //SetAsVector();SetAsEdge(v1:b2Vec2, v2:b2Vec2)将一组保存在piont数组中的顶点连接起来,绘制成 刚体的多边形形状
    let def = new this.b2FixtureDef();
    def.shape = shape;
    /*密度*/
    def.density = d;
    /*摩擦*/
    def.friction = f;
    /*弹力*/
    def.restitution = e;
    c.CreateFixture(def);
  };

  createVerticesArray(a) {
    let i, l;
    let v = new Array();
    if (a.length < 3) {
      return v;
    }
    for (i = 0, l = a.length; i < l; i++) {
      v.push(new this.b2Vec2(a[i][0] / this.drawScale, a[i][1] / this.drawScale));
    }
    return v;
  };

  getBodyAtMouse(mouseX, mouseY) {
    this.mousePVec = new this.b2Vec2(mouseX, mouseY);
    //AABB意思Axis Aligned Bounding Box，平行于坐标轴的包围盒子，即最小矩形。用两个顶点坐标标示，
    //lowerBound:b2Vec2:表示b2AABB矩形的左上角坐标
    //upperBound:b2Vec2:表示b2AABB矩形的右下角坐标
    //可以用lowerBound.y获取刚体的最高点，判断砖块高度是否过关
    //可以用b2Fixture.GetAABB()获取刚体最小包围盒
    let aabb = new this.b2AABB();
    aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
    aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
    this.selectedBody = null;

    //用wold.QueryAABB(callback,aabb),形状模糊查找
    //b2Wold中所有与指定AABB有潜在碰撞风险的b2Fixture对象,就是指b2Fixture与FattenAABB（非最小包围盒，有这个包围盒是为了碰撞性能计算）
    this.world.QueryAABB((fixture) => {
      this.getBodyCallBack(fixture)
    }, aabb);
    return this.selectedBody;
  };

  getBodyCallBack(fixture) {
    if (fixture.GetBody().GetType() != this.b2Body.b2_staticBody) {
      if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), this.mousePVec)) {
        this.selectedBody = fixture.GetBody();
        return false;
      }
    }
    return true;
  };

  update() {
    //在更新的时候检测removeList数组,然后用world.DestroyBody(box2dBody)
    for (let k in this.removeList) {
      this.world.DestroyBody(this.removeList[k]);
    }
    this.removeList.splice(0, this.removeList.length);
    if (this.stop) {
      return;
    }

    //TODO 30/60
    this.world.Step(1 / 60, 10, 10);
    this.world.ClearForces();
    if (this.debug) {
      this.world.DrawDebugData();
    }
  };


  mouseJoint_start(eve) {
    if (this.mouseJoint || this.stop) return

    let mX = eve.stageX / this.drawScale, mY = eve.stageY / this.drawScale, b = this.getBodyAtMouse(mX, mY);
    if (b && b.mouseJoint) {
      var m = new this.b2MouseJointDef();
      m.bodyA = this.world.GetGroundBody();
      m.bodyB = b;
      m.target.Set(mX, mY);
      m.collideConnected = true;
      m.maxForce = 300000.0 * b.GetMass();
      this.mouseJoint = this.world.CreateJoint(m);
      b.SetAwake(true);
    }
  }


  mouseJoint_move(eve) {
    if (!this.mouseJoint) return

    let mX = eve.stageX / this.drawScale, mY = eve.stageY / this.drawScale;
    this.mouseJoint.SetTarget(new this.b2Vec2(mX, mY));
  }

  mouseJoint_end() {
    if (this.mouseJoint) {
      this.world.DestroyJoint(this.mouseJoint);
      this.mouseJoint = null;
    }
  }
}

Sprite.prototype.setBodyMouseJoint = function (value) {
  if (!this.box2dBody) {
    return;
  }
  this.box2dBody.mouseJoint = value;
};

//清除box2dBody
Sprite.prototype.clearBody = function (box2d, value) {
  if (!this.box2dBody) {
    return;
  }
  box2d.removeList.push(this.box2dBody);
  this.box2dBody = null;
};

Sprite.prototype.addBodyCircle = function (box2d, radius, cx, cy, type, density = 0.5, friction = 0.4, restitution = 0.8) {
  this.rotatex = radius;
  this.rotatey = radius;
  this.box2dBody = box2d.addCircle(radius / box2d.drawScale, (this.x + cx) / box2d.drawScale, (this.y + cy) / box2d.drawScale, (type == 1) ? box2d.b2Body.b2_dynamicBody : box2d.b2Body.b2_staticBody, density, friction, restitution);
  //自动把当前Sprite保存到刚体UserData中
  this.box2dBody.SetUserData(this);
};

Sprite.prototype.addBodyPolygon = function (box2d, width, height, type, density = 0.5, friction = 0.4, restitution = 0.8) {
  this.rotatex = width / 2;
  this.rotatey = height / 2;
  this.box2dBody = box2d.addPolygon(width / 2 / box2d.drawScale, height / 2 / box2d.drawScale, this.x / box2d.drawScale, this.y / box2d.drawScale, (type == 1) ? box2d.b2Body.b2_dynamicBody : box2d.b2Body.b2_staticBody, density, friction, restitution);
  this.box2dBody.SetUserData(this);
};

Sprite.prototype.addBodyVertices = function (box2d, vertices, cx, cy, type, density, friction, restitution) {
  this.rotatex = 0;
  this.rotatey = 0;
  this.box2dBody = box2d.addVertices(vertices, (type == 1) ? box2d.b2Body.b2_dynamicBody : box2d.b2Body.b2_staticBody, density, friction, restitution);
  this.box2dBody.SetUserData(this);
  this.box2dBody.SetPosition(new box2d.b2Vec2((this.x + cx) / box2d.drawScale, (this.y + cy) / box2d.drawScale));
};

export default B2d
