// Base query statement for searching wafers
const baseQuery = `
  SELECT * FROM wafers
  WHERE batchNumber = :batchNumber
  AND status = :status
`;

// Function to construct the complete query
const constructQuery = (userValues) => {
  // Destructure user values
  const { batchNumber, status, additionalFilters } = userValues;

  // Construct the final query with user-provided values
  let finalQuery = baseQuery;

  // Append additional filters if provided
  if (additionalFilters) {
    additionalFilters.forEach((filter) => {
      finalQuery += ` AND ${filter.field} ${filter.operator} :${filter.field}`;
    });
  }

  return finalQuery;
};