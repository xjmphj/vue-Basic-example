import CodeMirror from 'codemirror';
import { render, createVNode } from 'vue';
import { FormulaTypes, TYPES } from '../config';
import { random } from '../hooks/use-functions';
import Label from './label.vue';
import { TinyEmitter } from 'tiny-emitter';
import { Parser } from 'hot-formula-parser';
import _debounce from 'lodash/debounce';
// import { FunctionMapType, IFunctionItem } from './use-function-list';
import { FunctionMapType, IFunctionItem } from '../hooks/use-functions';
import { appContext } from '@/plugins/app-context/index';
import { FormulaItem } from '../hooks/use-formula-config';
import { valueConvert2Backend } from './value-convert';
function isNode<T>(item: any): item is T {
  return item.nodeType === 1;
}
export interface IValueTokenItem {
  label: string;
  value: string;
  type: TYPES;
  config?: any;
}
interface IInsertElementOption {
  className: string[];
}

export default class Formula extends TinyEmitter {
  cm: CodeMirror.Editor;
  appContext = appContext;
  parser;
  functionLabelMap: FunctionMapType = {};
  event = {
    valid: 'validate',
  };
  private validByFunction = false;
  constructor(cm: CodeMirror.Editor) {
    super();
    this.cm = cm;
    this.parser = new Parser();
    const validate = _debounce(this.validate.bind(this), 500);
    cm.on('change', (cm) => {
      cm.showHint();
      validate();
    });
  }
  setFormulaFunction(functionList: Array<IFunctionItem>) {
    functionList.forEach((item) => {
      if (typeof item.func === 'function') {
        this.parser.setFunction(item.value.slice(1), (...args: any[]) => {
          const result = item.func!(...args[0]);
          if (!result.error) {
            return result.ret;
          } else {
            this.emit(this.event.valid, result.error);
            this.validByFunction = true;
            throw new Error('参数错误');
          }
        });
      }
    });
  }
  createElement(tag: 'span' | 'div', innerText?: string, className?: string[]) {
    const el = document.createElement(tag);
    if (innerText !== undefined) {
      el.innerHTML = innerText;
    }
    if (className) {
      el.classList.add(...className);
    }
    return el;
  }
  insertElement(
    tag: 'span' | 'div' | HTMLElement,
    label: string,
    value: string,
    options?: IInsertElementOption
  ) {
    const c = this.cm.getCursor();
    this.cm.replaceSelection(value);
    const d = this.cm.getCursor();
    const marker = this.cm.markText(c, d, {
      selectLeft: true,
      selectRight: true,
      handleMouseEvents: true,
      atomic: true,
      attributes: { 'data-test': value },
      replacedWith:
        typeof tag === 'string' ? this.createElement(tag, label, options?.className || []) : tag,
    });
    this.cm.focus();
    return { pos: { o: c, t: d }, marker };
  }
  insertFunction(
    func: { label: string; paramsCount?: number },
    opts: { addBracket?: boolean } = { addBracket: true }
  ) {
    this.cm.replaceSelection(`${func.label}`);
    const { line, ch } = this.cm.getCursor();
    if (opts.addBracket) {
      func.paramsCount = func.paramsCount && func.paramsCount > 0 ? func.paramsCount : 0;
      this.cm.replaceSelection(`(${new Array(func.paramsCount).fill(' ').join(',')})`);
      func.paramsCount > 0 && this.cm.setCursor({ line, ch: ch + 1 });
    }
    this.cm.focus();
  }
  insertBracket() {
    this.cm.replaceSelection(`()`);
    this.cm.execCommand('goCharLeft');
    this.cm.focus();
  }
  insertOperation(v: string) {
    this.cm.replaceSelection(v);
    this.cm.focus();
  }
  insertField<T>(label: string, value: string, config: T, type?: TYPES) {
    let el;
    if (this.appContext) {
      const vNode = createVNode(Label, { label });
      vNode.appContext = this.appContext;
      el = this.createElement('span');
      render(vNode, el);
    } else {
      el = this.createElement('span', label);
    }
    const { marker } = this.insertElement(el, label, value);
    // @ts-ignore
    const wrap = marker.widgetNode as HTMLSpanElement & { config?: T };

    wrap.setAttribute('data-value', `[${value}]`);
    wrap.setAttribute('data-type', type ?? TYPES.field);
    wrap.setAttribute('data-label', label);
    if (config) {
      wrap.config = config;
    }
  }
  insertDigital(value: string) {
    this.cm.replaceSelection(value);
    this.cm.focus();
  }
  tokenFactory(label: string, value: string, type: TYPES, config?: any) {
    return { label, value, type, config };
  }
  setValue(tokens: IValueTokenItem[]) {
    this.cm.setValue('');
    tokens.forEach((token) => {
      if (token.type === TYPES.field) {
        this.insertField(token.label, token.value, token.config);
      }
      if (token.type === TYPES.logic_field) {
        this.insertField(token.label, token.value, token.config, TYPES.logic_field);
      } else if (token.type === TYPES.custom_page) {
        this.insertField(token.label, token.value, token.config, TYPES.custom_page);
      } else if (token.type === TYPES.edit_selector) {
        this.insertField(token.label, token.value, token.config, TYPES.edit_selector);
      } else if (token.type === TYPES.function) {
        this.insertFunction({ label: token.label }, { addBracket: false });
      } else if (token.type === TYPES.operation) {
        this.insertOperation(token.value);
      } else if (token.type === TYPES.digital) {
        this.insertDigital(token.value);
      } else if (token.type === TYPES.bracket) {
        this.insertOperation(token.value);
      } else if (
        token.type === TYPES.comma ||
        token.type === TYPES.space ||
        token.type === TYPES.unknown
      ) {
        this.insertOperation(token.value);
      }
    });
  }
  get valueTokens() {
    // @ts-ignore
    const pres = Array.from((this.cm.display.lineDiv as HTMLDivElement).children);
    const ret: Array<Array<ReturnType<typeof this.tokenFactory>>> = [];
    pres.forEach((item, index) => {
      ret[index] = [];
      Array.from((item.firstChild as HTMLSpanElement).childNodes).forEach((item) => {
        if (isNode<HTMLSpanElement & { config?: any }>(item)) {
          const type = item.getAttribute('data-type');
          // 是选择的字段
          if (
            type &&
            (type === TYPES.field ||
              type === TYPES.logic_field ||
              type === TYPES.custom_page ||
              type === TYPES.edit_selector)
          ) {
            const label = item.getAttribute('data-label') || '';
            const value = item.getAttribute('data-value') || '';
            ret[index].push(this.tokenFactory(label, value, type, item.config));
          } else {
            const classNames = Array.from(item.classList).filter((item) => item.startsWith('cm-'));
            if (classNames.length > 0) {
              const type = classNames[0].slice(3) as TYPES;
              let value = item.textContent || '';
              const label = item.textContent || '';
              if (type === TYPES.function && this.functionLabelMap[label]) {
                value = `${this.functionLabelMap[label].value}`;
              }
              ret[index].push(this.tokenFactory(item.textContent || '', value, type));
            }
          }
        } else if (item.nodeType === 3) {
          ret[index].push(
            this.tokenFactory(item.textContent || '', item.textContent || '', TYPES.unknown)
          );
        }
      });
    });
    return ret;
  }
  // 获取已经选择的字段来自的模型集合
  getFieldModelCodes() {
    const modelCodes: string[] = [];
    this.valueTokens.map((item) => {
      item.forEach((subItem) => {
        if (subItem.type === TYPES.field) {
          if (subItem.config) {
            modelCodes.push((subItem.config as any).unionCode);
          } else {
            console.log('公式编辑：字段上不存在config属性');
          }
        }
      });
    });
    return modelCodes;
  }
  validate() {
    // 如果是多行，每一行分开校验
    const format = this.valueTokens.map((item) => {
      let ret = '';
      item.forEach((subItem) => {
        if (
          subItem.type === TYPES.field ||
          subItem.type === TYPES.logic_field ||
          subItem.type === TYPES.custom_page ||
          subItem.type === TYPES.edit_selector
        ) {
          // 所有的字段先全部当数字来处理
          ret += ` ${random()} `; // 加一个空格，用来和相邻字段隔开
        } else if (subItem.type === TYPES.function) {
          ret += subItem.value.slice(1);
        } else {
          ret += subItem.value;
        }
      });
      return ret;
    });
    let validError = null;
    for (const item of format) {
      this.validByFunction = false;
      const ret = this.parser.parse(item);
      if (ret.error !== null) {
        validError = ret.error;
        break;
      } else {
        this.emit(this.event.valid, null);
      }
    }
    if (validError !== null && !this.validByFunction) {
      // formula本身校验产生的错误
      this.emit(this.event.valid, '公式格式有误');
    } else if (!this.validByFunction) {
      this.emit(this.event.valid, null);
    }
    return validError === null;
  }
  getValue(valid = true, opt?: { required?: boolean }) {
    let value = '';
    const formulaConfig: FormulaItem[] = [];
    if ((valid && this.validate()) || !valid) {
      this.valueTokens.forEach((item, index) => {
        if (index !== 0) value += `\n`;
        item.forEach((subItem) => {
          value += subItem.value;
          if (typeof valueConvert2Backend[subItem.type] === 'function') {
            formulaConfig.push(valueConvert2Backend[subItem.type](subItem));
          } else if (subItem.type === TYPES.function) {
            formulaConfig.push({
              type: FormulaTypes.FUNCTION_NAME,
              value: subItem.value,
              label: subItem.label,
            });
          } else if ([TYPES.bracket, TYPES.operation, TYPES.comma].includes(subItem.type)) {
            formulaConfig.push({
              type: FormulaTypes.SEPARATOR,
              value: subItem.value,
              label: subItem.label,
            });
          } else if ([TYPES.digital, TYPES.unknown, TYPES.space].includes(subItem.type)) {
            formulaConfig.push({
              type: FormulaTypes.CONSTANT,
              value: subItem.value,
              label: subItem.label,
            });
          }
        });
      });
      if (opt?.required && value === '') {
        this.emit(this.event.valid, '公式不能为空');
        return { valid: false, result: null };
      }
      return { valid: true, result: { value, formulaConfig } };
    } else {
      return { valid: false, result: null };
    }
  }
}
