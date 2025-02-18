import React from 'react';
import PropTypes from 'prop-types';
import classes from './Form.module.css';

export const FormSection = ({ title, children, description }) => (
    <section className={classes.section}>
        <h3 className={classes.sectionHeader}>{title}</h3>
        {description && (
            <p className={classes.sectionDescription}>{description}</p>
        )}
        {children}
    </section>
)

FormSection.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
}