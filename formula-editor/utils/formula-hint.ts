import CodeMirror from 'codemirror';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/hint/anyword-hint';
import { TYPES } from '../config';
interface IList {
  [key: string]: Array<string>;
}
export const formulaHint = (functionList: string[]) => {
  CodeMirror.defineMode('formula', function () {
    const isOperatorChar = /[+\-*%/]/;
    function parseWords(str: string) {
      const obj = {},
        words = str.split(' ');
      for (let i = 0; i < words.length; ++i) obj[words[i]] = true;
      return obj;
    }
    // 关键字
    const keywords = parseWords(functionList.join(' '));
    interface IState {
      tokenize: typeof tokenBase;
      beforeParams: boolean;
      inParams: boolean;
    }

    function tokenBase(stream: CodeMirror.StringStream, state: IState) {
      // let beforeParams = state.beforeParams
      state.beforeParams = false;
      const ch = stream.next() as string;
      if (ch === ',') {
        return TYPES.comma;
      } else if (isOperatorChar.test(ch)) {
        return TYPES.operation;
      } else if (ch === '(' || ch === ')') {
        return TYPES.bracket;
      } else if (ch == '.' && stream.match(/^\d[\d_]*(?:[eE][+-]?[\d_]+)?/)) {
        return TYPES.digital;
      } else if (/\d/.test(ch)) {
        stream.eatWhile(/[\w.]/);
        return TYPES.digital;
      } else {
        stream.eatWhile(/[\w$_{}\xa1-\uffff]/);
        const word = stream.current();
        if (keywords && Object.prototype.propertyIsEnumerable.call(keywords, word)) {
          state.beforeParams = true;
          return TYPES.function;
        }
        return null;
      }
    }
    return {
      startState: function () {
        return {
          tokenize: tokenBase,
          beforeParams: false,
          inParams: false,
        };
      },
      token: function (stream, state) {
        if (stream.eatSpace()) return TYPES.space;
        return state.tokenize(stream, state);
      },
    };
  });
  function getZKH(list: IList, str: string) {
    const location = str.search(/[\w]+\[[\w\s,]*\]\.$/i);
    if (location != -1) {
      str = str.substring(location, str.length);
      str = str.substring(0, str.search(/\[[\w\s,]*\]\.$/i));
      for (const key in list) {
        if (key.toLowerCase() == str.toLowerCase()) {
          return list[key];
        }
      }
    }
    return null;
  }
  //是否包含圆括号
  function getYKH(list: IList, str: string) {
    const location = str.search(/[\w]+\([\w\s,]*\)\.$/i);
    if (location != -1) {
      str = str.substring(location, str.length);
      str = str.substring(0, str.search(/\([\w\s,]*\)\.$/i));
      for (const key in list) {
        if (key.toLowerCase() == str.toLowerCase()) {
          return list[key];
        }
      }
    }
    return null;
  }
  function getNormal(list: IList, str: string) {
    let location = str.search(/[\w]+\([\w\s,]*\)\.[\w]*$/i);
    let result: any = null;
    if (location != -1) {
      //匹配到有前缀方法   ()
      str = str.substring(location, str.length);
      if (str.search(/\.$/i) + 1 == str.length) {
        //.后无字符
        return getYKH(list, str);
      }
      const tstr = str.substring(str.search(/\.[\w]+$/i) + 1, str.length);
      str = str.substring(0, str.search(/\.[\w]+$/i));
      const res = getYKH(list, str);
      if (res != null) {
        result = [];
        for (const v in res) {
          if (v.indexOf(tstr) == 0) {
            result.push(v);
          }
        }
      }
      return result;
    }
    location = str.search(/[\w]+\[[\w\s]*\]\.[\w]*$/i);
    if (location != -1) {
      //匹配到有前缀方法   []
      str = str.substring(location, str.length);
      if (str.search(/\.$/i) + 1 == str.length) {
        //.后无字符
        return getZKH(list, str);
      }
      const tstr = str.substring(str.search(/\.[\w]+$/i) + 1, str.length);
      str = str.substring(0, str.search(/\.[\w]+$/i));
      const res = getYKH(list, str);
      if (res != null) {
        result = [];
        for (const v in res) {
          if (v.indexOf(tstr) == 0) {
            result.push(v);
          }
        }
      }
      return result;
    }
    location = str.search(/[\w]+\.$/i);
    if (location != -1) {
      str = str.substring(location, str.length - 1);
      result = [];
      for (const v in list) {
        if (v == str) {
          result = list[v];
          break;
        }
      }
      return result;
    }
    location = str.search(/[\w]+$/i);
    if (location != -1) {
      str = str.substring(location, str.length);
      result = [];
      for (const v in list) {
        if (v.toLowerCase().indexOf(str.toLowerCase()) == 0) {
          result.push(v);
        }
      }
      return result;
    }
    return result;
  }

  function dataList(cm: CodeMirror.Editor) {
    const hintList = {};
    for (let index = 0; index < functionList.length; index++) {
      hintList[functionList[index] + '()'] = [];
    }

    const cur = cm.getCursor(),
      token = cm.getTokenAt(cur); //重写getTokenAt()方法，返回一整行字符串
    const inputParam = token.string;
    const start = inputParam.search(/\.[\w]*$/i);
    const result = getNormal(hintList, inputParam);
    if (result != null) return [result, start];
    return [];
  }
  CodeMirror.registerHelper('hint', 'formula', function (cm: CodeMirror.Editor) {
    // 自动补全
    let list = dataList(cm);
    const cur = cm.getCursor(), //获取游标 eg.键盘输入aabb，cur的值为： {line: 0, ch: 4, sticky: null}
      token = cm.getTokenAt(cur); //示例token的值为： {start: 0, end: 4, string: "aabb", type: null, state: {…}}
    let start = token.start;
    const end = cur.ch;
    if (list.length > 1) {
      const v = list[1] as number;
      list = list[0] as any[];
      if (v !== -1) start = v + 1;
    }

    if (list.length) {
      return {
        list: list,
        from: CodeMirror.Pos(cur.line, start),
        to: CodeMirror.Pos(cur.line, end),
      };
    }
  });

  CodeMirror.defineMIME('text/x-formula', 'formula');
};
