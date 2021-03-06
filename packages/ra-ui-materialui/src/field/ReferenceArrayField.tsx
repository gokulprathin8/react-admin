import * as React from 'react';
import { Children, cloneElement, FC, memo, ReactElement } from 'react';
import PropTypes from 'prop-types';
import { LinearProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
    ListContextProvider,
    ListControllerProps,
    useReferenceArrayFieldController,
    Sort,
    Filter,
} from 'ra-core';

import { fieldPropTypes, FieldProps, InjectedFieldProps } from './types';
import { ClassesOverride } from '../types';
import sanitizeRestProps from './sanitizeRestProps';

/**
 * A container component that fetches records from another resource specified
 * by an array of *ids* in current record.
 *
 * You must define the fields to be passed to the iterator component as children.
 *
 * @example Display all the products of the current order as datagrid
 * // order = {
 * //   id: 123,
 * //   product_ids: [456, 457, 458],
 * // }
 * <ReferenceArrayField label="Products" reference="products" source="product_ids">
 *     <Datagrid>
 *         <TextField source="id" />
 *         <TextField source="description" />
 *         <NumberField source="price" options={{ style: 'currency', currency: 'USD' }} />
 *         <EditButton />
 *     </Datagrid>
 * </ReferenceArrayField>
 *
 * @example Display all the categories of the current product as a list of chips
 * // product = {
 * //   id: 456,
 * //   category_ids: [11, 22, 33],
 * // }
 * <ReferenceArrayField label="Categories" reference="categories" source="category_ids">
 *     <SingleFieldList>
 *         <ChipField source="name" />
 *     </SingleFieldList>
 * </ReferenceArrayField>
 *
 * By default, restricts the displayed values to 1000. You can extend this limit
 * by setting the `perPage` prop.
 *
 * @example
 * <ReferenceArrayField perPage={10} reference="categories" source="category_ids">
 *    ...
 * </ReferenceArrayField>
 *
 * By default, the field displays the results in the order in which they are referenced
 * (i.e in the order of the list of ids). You can change this order
 * by setting the `sort` prop (an object with `field` and `order` properties).
 *
 * @example
 * <ReferenceArrayField sort={{ field: 'name', order: 'ASC' }} reference="categories" source="category_ids">
 *    ...
 * </ReferenceArrayField>
 *
 * Also, you can filter the results to display only a subset of values. Use the
 * `filter` prop for that.
 *
 * @example
 * <ReferenceArrayField filter={{ is_published: true }} reference="categories" source="category_ids">
 *    ...
 * </ReferenceArrayField>
 */
const ReferenceArrayField: FC<ReferenceArrayFieldProps> = props => {
    const {
        basePath,
        children,
        filter,
        page = 1,
        perPage,
        record,
        reference,
        resource,
        sort,
        source,
    } = props;

    if (React.Children.count(children) !== 1) {
        throw new Error(
            '<ReferenceArrayField> only accepts a single child (like <Datagrid>)'
        );
    }
    const controllerProps = useReferenceArrayFieldController({
        basePath,
        filter,
        page,
        perPage,
        record,
        reference,
        resource,
        sort,
        source,
    });
    return (
        <ListContextProvider value={controllerProps}>
            <PureReferenceArrayFieldView {...props} {...controllerProps} />
        </ListContextProvider>
    );
};

ReferenceArrayField.propTypes = {
    ...fieldPropTypes,
    addLabel: PropTypes.bool,
    basePath: PropTypes.string,
    classes: PropTypes.object,
    className: PropTypes.string,
    children: PropTypes.element.isRequired,
    label: PropTypes.string,
    record: PropTypes.any,
    reference: PropTypes.string.isRequired,
    resource: PropTypes.string,
    sortBy: PropTypes.string,
    sortByOrder: fieldPropTypes.sortByOrder,
    source: PropTypes.string.isRequired,
};

ReferenceArrayField.defaultProps = {
    addLabel: true,
};

export interface ReferenceArrayFieldProps
    extends FieldProps,
        InjectedFieldProps {
    children: ReactElement;
    classes?: ClassesOverride<typeof useStyles>;
    filter?: Filter;
    page?: number;
    pagination?: ReactElement;
    perPage?: number;
    reference: string;
    resource?: string;
    sort?: Sort;
}

const useStyles = makeStyles(
    theme => ({
        progress: { marginTop: theme.spacing(2) },
    }),
    { name: 'RaReferenceArrayField' }
);

export interface ReferenceArrayFieldViewProps
    extends Omit<
            ReferenceArrayFieldProps,
            'basePath' | 'resource' | 'page' | 'perPage'
        >,
        ListControllerProps {
    classes?: ClassesOverride<typeof useStyles>;
}

export const ReferenceArrayFieldView: FC<
    ReferenceArrayFieldViewProps
> = props => {
    const { children, pagination, className, reference, ...rest } = props;
    const classes = useStyles(props);

    if (!props.loaded) {
        return <LinearProgress className={classes.progress} />;
    }

    return (
        <>
            {cloneElement(Children.only(children), {
                ...sanitizeRestProps(rest),
                className,
                resource: reference,
            })}{' '}
            {pagination &&
                props.total !== undefined &&
                cloneElement(pagination, sanitizeRestProps(rest))}
        </>
    );
};

ReferenceArrayFieldView.propTypes = {
    basePath: PropTypes.string,
    classes: PropTypes.any,
    className: PropTypes.string,
    data: PropTypes.any,
    ids: PropTypes.array,
    loaded: PropTypes.bool,
    children: PropTypes.element.isRequired,
    reference: PropTypes.string.isRequired,
};

const PureReferenceArrayFieldView = memo(ReferenceArrayFieldView);

export default ReferenceArrayField;
