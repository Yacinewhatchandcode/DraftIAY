import React from 'react';
import { useReactFlow } from '@xyflow/react';

export default function GroupNode({ id, data, selected }) {
    const { setNodes } = useReactFlow();

    const onLabelChange = (evt) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: { ...node.data, label: evt.target.value },
                    };
                }
                return node;
            })
        );
    };

    return (
        <div
            className={`group-node group-color-${data.color || 'grey'} ${selected ? 'selected' : ''}`}
            style={{
                width: data.width || 400,
                height: data.height || 300,
            }}
        >
            <div className="group-header custom-drag">
                <input
                    className="group-title nodrag"
                    value={data.label}
                    onChange={onLabelChange}
                    placeholder="Group Title"
                />
            </div>
            <div className="group-content-area" />
        </div>
    );
}
