import React from 'react';

type Props = {
    text: string;
};

export default class HideableText extends React.Component<Props> {
    constructor (props: Props) {
        super(props);
    }

    render () {
        return (
            <>
            <div>
                <button>Toggle</button>
                {this.props.text}
            </div>
            </>
        );
    }
}