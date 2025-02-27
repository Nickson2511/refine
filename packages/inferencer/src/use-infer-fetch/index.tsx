import React from "react";
import { useDataProvider, useResource, BaseKey } from "@pankod/refine-core";

import { pickDataProvider, dataProviderFromResource } from "@/utilities";

/**
 * This hook will handle the data fetching for the inferencer with `loading` and `initial` states.
 * Data provider functions will be used respectively for the `list`, `show` and `edit` types.
 */
export const useInferFetch = (
    type: "list" | "show" | "edit" | "create",
    resourceNameOrRouteName: string,
    idFromProps?: string | number,
) => {
    const {
        resource,
        resourceName,
        id: idFromURL,
        resources,
    } = useResource({
        resourceNameOrRouteName,
    });

    const id = idFromProps ?? idFromURL;

    const dataProvider = useDataProvider();

    const [error, setError] = React.useState<string | undefined>(undefined);

    const [data, setData] = React.useState<Record<string, unknown> | undefined>(
        undefined,
    );
    const [initial, setInitial] = React.useState<boolean>(true);
    const [loading, setLoading] = React.useState<boolean>(false);

    const resolver = React.useCallback(
        async (recordItemId: BaseKey | undefined) => {
            const dataProviderName =
                dataProviderFromResource(resource) ??
                pickDataProvider(resourceName, undefined, resources);
            const dp = dataProvider(dataProviderName);

            setLoading(true);
            setError(undefined);

            try {
                if (type === "list" || type === "create") {
                    const response = await dp.getList({
                        resource: resourceName,
                    });
                    const r = response.data?.[0];

                    if (!r) {
                        setError(
                            `<p>No records/data found for resource "${resourceName}".</p>
                            <p>Please check your data provider and resource.</p>
                            <p>For more info, please check the <a href="https://refine.dev/docs/packages/documentation/inferencer/" target="_blank">documentation</a>.</p>`,
                        );
                    }
                    setData(r);
                    setTimeout(() => {
                        setLoading(false);
                    }, 500);
                }
                if ((type === "edit" || type === "show") && recordItemId) {
                    const response = await dp.getOne({
                        resource: resourceName,
                        id: recordItemId,
                    });
                    const r = response.data;
                    if (!r) {
                        setError(
                            `<p>No records/data found for resource "${resourceName}".</p>
                            <p>Please check your data provider and resource.</p>
                            <p>For more info, please check the <a href="https://refine.dev/docs/packages/documentation/inferencer/" target="_blank">documentation</a>.</p>`,
                        );
                    }
                    setData(r);
                    setTimeout(() => {
                        setLoading(false);
                    }, 500);
                }
            } catch (error) {
                console.warn(
                    "An error occured while fetching the resource data. Please check the error message below:",
                    error,
                );
                setError(
                    `<p>Something went wrong while fetching the resource data.</p>
                    <p>Please check your data provider and API for resource "${resourceName}".</p>
                    <p>For more info, please check the <a href="https://refine.dev/docs/packages/documentation/inferencer/" target="_blank">documentation</a>.</p>`,
                );
                setTimeout(() => {
                    setLoading(false);
                }, 500);
            }
        },
        [type, dataProvider, resource, resourceName, resources],
    );

    React.useEffect(() => {
        setInitial(false);
        if (!loading && !data) {
            resolver(id);
        }
    }, [resolver, id]);

    return {
        data,
        loading,
        initial,
        error,
    };
};
