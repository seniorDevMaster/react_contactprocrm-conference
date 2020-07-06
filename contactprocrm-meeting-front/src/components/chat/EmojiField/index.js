import React, { Component } from 'react';
import emojiConverter from './emojiConverter';
import PropTypes from 'prop-types';
import EmojiPicker from 'emoji-picker-react';
import './style.scss';

class EmojiField extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value || '',
            initialMount: false,
            pickerOpen: props.pickerOpen || false
        };

        this.emojiConverter = emojiConverter(props.config);

        this.onChange = this.onChange.bind(this);
        this.onTriggerClick = this.onTriggerClick.bind(this);
        this.onEmojiClick = this.onEmojiClick.bind(this);
        this.isAnOutsideClick = this.isAnOutsideClick.bind(this);
        this.onPickerkeypress = this.onPickerkeypress.bind(this);
        this.closePicker = this.closePicker.bind(this);
        this.openPicker = this.openPicker.bind(this);
    }

    componentDidUpdate() {
        if (this.state.pickerOpen) {
            setTimeout(() => {
                window.addEventListener('click', this.isAnOutsideClick);
                window.addEventListener('keyup', this.onPickerkeypress);
            });
        }
    }

    unifyValue(value) {
        this.unifiedValue = this.emojiConverter.replace_colons(value);
        return this.unifiedValue;
    }

    getUnicode() {
        const allowNative = this.emojiConverter.allow_native;
        this.emojiConverter.allow_native = true;
        const unicodeValue = this.emojiConverter.replace_colons(this.state.value);
        this.emojiConverter.allow_native = allowNative;
        return unicodeValue;
    }

    getImages() {
        const allowNative = this.emojiConverter.allow_native;
        this.emojiConverter.allow_native = false;
        const unicodeValue = this.emojiConverter.replace_colons(this.state.value);
        this.emojiConverter.allow_native = allowNative;
        return unicodeValue;
    }

    onChange(e) {
        const value = e && e.target ? e.target.value : this.state.value;
        // console.log('emoji/ value: ', value)
        this.setState({ value }, () => {
            // if (typeof this.props.onChange === 'function') {
                // console.log(e);
                // this.props.onChange(e, value);
            // }
        });
    }

    isAnOutsideClick(e) {
        e.preventDefault();
        const shouldClose = !this._picker || !this._picker._picker.contains(e.target);

        if (shouldClose) {
            this.closePicker();
        }
    }

    onPickerkeypress(e) {
        if (e.keyCode === 27 || e.which === 27 || e.key === 'Escape' || e.code === 'Escape') {
            this.closePicker();
        }
    }

    closePicker() {
        this.setState({
            pickerOpen: false
        }, () => {
            window.removeEventListener('click', this.isAnOutsideClick);
            window.removeEventListener('keyup', this.onPickerkeypress);
        });
    }

    openPicker() {
        this.setState({
            pickerOpen: true
        }, () => {
            window.addEventListener('click', this.isAnOutsideClick);
            window.addEventListener('keyup', this.onPickerkeypress);
        });
    }

    onTriggerClick(e) {
        e.preventDefault();
        e.stopPropagation();

        this.state.pickerOpen ? this.closePicker() : this.openPicker();
    }

    onEmojiClick(code, emoji) {
        const value = this.state.value,
            // selection = this._field.selectionStart,
            // shortcode = `:${emoji.name}:`,
            // v1 = value.slice(0, selection),
            // v2 = value.slice(selection),
            newValue = value + emoji.emoji; // `${v1}${shortcode}${v2}`;
            // console.log(selection, emoji, v1, v2);
        this.setState(
            {value: newValue},
            () => {
                // this._field.selectionStart = selection + shortcode.length;
                this.onChange(value);
                this._field.focus();
                this._field.setSelectionRange(this._field.value.length, this._field.value.length);
            }
        );

        if (this.props.autoClose) {
            this.closePicker();
        }
    }

    render() {
        const { autoClose, onChange, config, fieldType, ...rest } = this.props;

        const isOpenClass = this.state.pickerOpen ? 'shown' : 'hidden',
            className = `emoji-text-field picker-${isOpenClass} emoji-${fieldType}`,
            { value, pickerOpen } = this.state,
            isInput = fieldType === 'input',
            ref = (_field) => this._field = _field;

        return (
            <div className={className}>
                {(isInput) && (<input {...rest} onChange={this.onChange} type="text" ref={ref} value={value}/>)}
                {(!isInput) && (<textarea {...rest} onChange={this.onChange} onKeyUp={(e)=>{
                    if( e.keyCode === 13) {
                        if (e.ctrlKey || e.altKey){
                            this.setState({...this.state, value: value+'\n'});
                            return;
                        }
                        this.props.onChange(value.trim());
                        this.setState({...this.state, value:''});
                    } 
                }}
                ref={ref} value={value}/>)}
                <a href="#!" className="emoji-trigger" onClick={this.onTriggerClick}>_</a>
                { pickerOpen && <div style={{position:'absolute'}}><EmojiPicker style={{width:'100%'}} onEmojiClick={this.onEmojiClick} /></div>}
            </div>
        );
    }
}

EmojiField.propTypes = {
    value: PropTypes.string,
    pickerOpen: PropTypes.bool,
    autoClose: PropTypes.bool,
    onChange: PropTypes.func,
    config: PropTypes.object,
    fieldType: PropTypes.string.isRequired
};

export default EmojiField;